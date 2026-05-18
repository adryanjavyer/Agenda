const BOOKINGS_STORAGE_KEY = "dkBarberBookings";

const professionals = [
  { id: "denner", name: "Denner Kerlon" },
  { id: "joao", name: "João Barber" },
];

const services = [
  { id: "pe-barba", name: "PE + Barba", duration: "30 min", price: "R$ 20,00", value: 20 },
  { id: "cabelo", name: "Cabelo", duration: "40 min", price: "R$ 30,00", value: 30 },
  { id: "barba-cabelo", name: "Barba + Cabelo", duration: "1h", price: "R$ 45,00", value: 45 },
  { id: "corte-pigmentacao", name: "Corte + Pigmentação", duration: "1h", price: "R$ 55,00", value: 55 },
];

const availableTimes = [
  "07:00 - 07:30", "07:30 - 08:00", "08:00 - 08:30", "08:30 - 09:00",
  "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
  "11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00",
  "13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00",
  "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00",
  "17:00 - 17:30", "17:30 - 18:00", "18:00 - 18:30", "18:30 - 19:00",
  "19:00 - 19:30", "19:30 - 20:00",
];

const statusOptions = ["Pendente", "Confirmado", "Concluído", "Cancelado"];

const state = {
  bookings: [],
  currentTab: "dashboard",
  filters: {
    search: "",
    status: "all",
    start: "",
    end: "",
  },
  report: {
    period: "daily",
    date: todayIso(),
  },
};

const tabs = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll("[data-panel]");
const todayRevenue = document.getElementById("todayRevenue");
const todayCount = document.getElementById("todayCount");
const todayCountHelp = document.getElementById("todayCountHelp");
const monthRevenue = document.getElementById("monthRevenue");
const monthCountHelp = document.getElementById("monthCountHelp");
const averageTicket = document.getElementById("averageTicket");
const todayBookingsList = document.getElementById("todayBookingsList");
const dashboardServiceRanking = document.getElementById("dashboardServiceRanking");
const bookingsTableBody = document.getElementById("bookingsTableBody");
const mobileBookingsList = document.getElementById("mobileBookingsList");
const emptyBookingsState = document.getElementById("emptyBookingsState");
const bookingSearch = document.getElementById("bookingSearch");
const statusFilter = document.getElementById("statusFilter");
const dateStartFilter = document.getElementById("dateStartFilter");
const dateEndFilter = document.getElementById("dateEndFilter");
const reportPeriod = document.getElementById("reportPeriod");
const reportDate = document.getElementById("reportDate");
const reportRangeText = document.getElementById("reportRangeText");
const reportRevenue = document.getElementById("reportRevenue");
const reportCount = document.getElementById("reportCount");
const reportCountHelp = document.getElementById("reportCountHelp");
const reportAverageTicket = document.getElementById("reportAverageTicket");
const reportCanceled = document.getElementById("reportCanceled");
const serviceReportList = document.getElementById("serviceReportList");
const professionalReportList = document.getElementById("professionalReportList");
const exportAllButton = document.getElementById("exportAllButton");
const exportReportButton = document.getElementById("exportReportButton");
const manualBookingForm = document.getElementById("manualBookingForm");
const manualClientName = document.getElementById("manualClientName");
const manualClientPhone = document.getElementById("manualClientPhone");
const manualProfessional = document.getElementById("manualProfessional");
const manualService = document.getElementById("manualService");
const manualDate = document.getElementById("manualDate");
const manualTime = document.getElementById("manualTime");
const manualStatus = document.getElementById("manualStatus");

function todayIso() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateBR(isoDate) {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseIsoDate(isoDate));
}

function formatDateShort(isoDate) {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(parseIsoDate(isoDate));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function parsePriceToNumber(price) {
  return Number(String(price).replace(/[^0-9,.-]/g, "").replace(".", "").replace(",", ".")) || 0;
}

function normalizePhoneForWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function getTimeStart(timeRange) {
  return String(timeRange || "").split("-")[0].trim();
}

function getBookingDateTime(booking) {
  const timeStart = getTimeStart(booking.time) || "00:00";
  return new Date(`${booking.bookingDateIso || todayIso()}T${timeStart}:00`);
}

function generateBookingId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DK-${datePart}-${randomPart}`;
}

function loadBookings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY)) || [];
    return parsed.map(normalizeBooking).sort((a, b) => getBookingDateTime(a) - getBookingDateTime(b));
  } catch (error) {
    return [];
  }
}

function saveBookings() {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(state.bookings));
}

function normalizeBooking(booking) {
  const serviceFromCatalog = services.find((service) => service.id === booking.serviceId || service.name === booking.serviceName);
  const professionalFromCatalog = professionals.find((professional) => professional.id === booking.professionalId || professional.name === booking.professionalName);

  return {
    id: booking.id || generateBookingId(),
    createdAt: booking.createdAt || new Date().toISOString(),
    updatedAt: booking.updatedAt || "",
    bookingDateIso: booking.bookingDateIso || todayIso(),
    dateLabel: booking.dateLabel || "",
    dateFormatted: booking.dateFormatted || formatDateShort(booking.bookingDateIso || todayIso()),
    time: booking.time || "07:00 - 07:30",
    professionalId: booking.professionalId || professionalFromCatalog?.id || "",
    professionalName: booking.professionalName || professionalFromCatalog?.name || "Profissional não informado",
    serviceId: booking.serviceId || serviceFromCatalog?.id || "",
    serviceName: booking.serviceName || serviceFromCatalog?.name || "Serviço não informado",
    serviceDuration: booking.serviceDuration || serviceFromCatalog?.duration || "",
    servicePrice: booking.servicePrice || serviceFromCatalog?.price || formatCurrency(booking.servicePriceValue || 0),
    servicePriceValue: Number(booking.servicePriceValue) || serviceFromCatalog?.value || parsePriceToNumber(booking.servicePrice),
    clientName: booking.clientName || "Cliente não informado",
    clientPhone: booking.clientPhone || "",
    status: statusOptions.includes(booking.status) ? booking.status : "Pendente",
    source: booking.source || "Site",
    city: booking.city || "Carbonita/MG",
  };
}

function isValidRevenueBooking(booking) {
  return booking.status !== "Cancelado";
}

function getFilteredBookings() {
  const search = state.filters.search.trim().toLowerCase();

  return state.bookings.filter((booking) => {
    const matchesSearch = !search || [
      booking.clientName,
      booking.clientPhone,
      booking.serviceName,
      booking.professionalName,
      booking.id,
      booking.status,
    ].join(" ").toLowerCase().includes(search);

    const matchesStatus = state.filters.status === "all" || booking.status === state.filters.status;
    const matchesStart = !state.filters.start || booking.bookingDateIso >= state.filters.start;
    const matchesEnd = !state.filters.end || booking.bookingDateIso <= state.filters.end;

    return matchesSearch && matchesStatus && matchesStart && matchesEnd;
  }).sort((a, b) => getBookingDateTime(a) - getBookingDateTime(b));
}

function getPeriodRange(period, anchorIso) {
  const anchor = parseIsoDate(anchorIso || todayIso());
  let start = new Date(anchor);
  let end = new Date(anchor);

  if (period === "weekly") {
    const mondayOffset = (anchor.getDay() + 6) % 7;
    start.setDate(anchor.getDate() - mondayOffset);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  }

  if (period === "monthly") {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  }

  const toIso = (date) => {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  };

  return {
    startIso: toIso(start),
    endIso: toIso(end),
    label: `${formatDateBR(toIso(start))} a ${formatDateBR(toIso(end))}`,
  };
}

function getBookingsInRange(startIso, endIso, includeCanceled = true) {
  return state.bookings.filter((booking) => {
    const inRange = booking.bookingDateIso >= startIso && booking.bookingDateIso <= endIso;
    if (!inRange) return false;
    return includeCanceled || isValidRevenueBooking(booking);
  });
}

function summarizeBookings(bookings) {
  const validBookings = bookings.filter(isValidRevenueBooking);
  const revenue = validBookings.reduce((sum, booking) => sum + (Number(booking.servicePriceValue) || 0), 0);
  const count = validBookings.length;

  return {
    revenue,
    count,
    averageTicket: count ? revenue / count : 0,
    canceled: bookings.filter((booking) => booking.status === "Cancelado").length,
  };
}

function groupBookings(bookings, keyGetter) {
  const validBookings = bookings.filter(isValidRevenueBooking);
  const map = new Map();

  validBookings.forEach((booking) => {
    const key = keyGetter(booking) || "Não informado";
    const current = map.get(key) || { name: key, count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += Number(booking.servicePriceValue) || 0;
    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue || b.count - a.count);
}

function statusClass(status) {
  return `status-${String(status || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
}

function statusPill(status) {
  return `<span class="status-pill ${statusClass(status)}">${status}</span>`;
}

function createStatusSelect(booking) {
  return `
    <select class="status-select" data-action="status" data-id="${booking.id}" aria-label="Alterar status">
      ${statusOptions.map((status) => `<option value="${status}" ${booking.status === status ? "selected" : ""}>${status}</option>`).join("")}
    </select>
  `;
}

function createActions(booking) {
  const phone = normalizePhoneForWhatsApp(booking.clientPhone);
  const whatsappHref = phone ? `https://wa.me/${phone}` : "#";

  return `
    <div class="actions-cell">
      <a class="action-button" href="${whatsappHref}" target="_blank" rel="noopener">WhatsApp</a>
      <button class="action-button danger" type="button" data-action="delete" data-id="${booking.id}">Excluir</button>
    </div>
  `;
}

function renderDashboard() {
  const today = todayIso();
  const monthRange = getPeriodRange("monthly", today);
  const todayBookings = getBookingsInRange(today, today, true);
  const monthBookings = getBookingsInRange(monthRange.startIso, monthRange.endIso, true);
  const allValid = state.bookings.filter(isValidRevenueBooking);

  const todaySummary = summarizeBookings(todayBookings);
  const monthSummary = summarizeBookings(monthBookings);
  const overallRevenue = allValid.reduce((sum, booking) => sum + (Number(booking.servicePriceValue) || 0), 0);

  todayRevenue.textContent = formatCurrency(todaySummary.revenue);
  todayCount.textContent = todaySummary.count;
  todayCountHelp.textContent = todaySummary.count === 1 ? "1 reserva válida hoje" : `${todaySummary.count} reservas válidas hoje`;
  monthRevenue.textContent = formatCurrency(monthSummary.revenue);
  monthCountHelp.textContent = monthSummary.count === 1 ? "1 serviço no mês" : `${monthSummary.count} serviços no mês`;
  averageTicket.textContent = formatCurrency(allValid.length ? overallRevenue / allValid.length : 0);

  const upcomingToday = todayBookings
    .filter((booking) => booking.status !== "Cancelado")
    .sort((a, b) => getBookingDateTime(a) - getBookingDateTime(b));

  todayBookingsList.innerHTML = upcomingToday.length
    ? upcomingToday.map((booking) => `
      <div class="booking-item">
        <div>
          <strong>${booking.time}</strong>
          <span>${booking.clientName} · ${booking.serviceName}</span>
        </div>
        ${statusPill(booking.status)}
      </div>
    `).join("")
    : `<div class="empty-state" style="display:block"><strong>Nenhum horário para hoje.</strong><p>Os agendamentos do dia aparecerão aqui.</p></div>`;

  const ranking = groupBookings(monthBookings, (booking) => booking.serviceName);
  renderRanking(dashboardServiceRanking, ranking, monthSummary.revenue);
}

function renderRanking(container, ranking, totalRevenue) {
  if (!ranking.length) {
    container.innerHTML = `<div class="empty-state" style="display:block"><strong>Sem dados no período.</strong><p>As vendas por serviço aparecerão aqui.</p></div>`;
    return;
  }

  container.innerHTML = ranking.map((item) => {
    const percent = totalRevenue ? Math.max(6, (item.revenue / totalRevenue) * 100) : 0;
    return `
      <div class="ranking-item" style="--bar-width:${percent}%">
        <div class="ranking-bar"></div>
        <div class="ranking-row">
          <div>
            <strong>${item.name}</strong>
            <span>${item.count} serviço${item.count > 1 ? "s" : ""}</span>
          </div>
          <strong>${formatCurrency(item.revenue)}</strong>
        </div>
      </div>
    `;
  }).join("");
}

function renderBookings() {
  const bookings = getFilteredBookings();
  emptyBookingsState.style.display = bookings.length ? "none" : "block";

  bookingsTableBody.innerHTML = bookings.map((booking) => `
    <tr>
      <td>
        <span class="table-main-text">${formatDateBR(booking.bookingDateIso)}</span>
        <span class="table-sub-text">${booking.time} · ${booking.id}</span>
      </td>
      <td>
        <a class="table-main-text client-link" href="https://wa.me/${normalizePhoneForWhatsApp(booking.clientPhone)}" target="_blank" rel="noopener">${booking.clientName}</a>
        <span class="table-sub-text">${booking.clientPhone || "Telefone não informado"}</span>
      </td>
      <td>
        <span class="table-main-text">${booking.serviceName}</span>
        <span class="table-sub-text">${booking.serviceDuration || "Duração não informada"}</span>
      </td>
      <td>${booking.professionalName}</td>
      <td><span class="table-main-text">${formatCurrency(booking.servicePriceValue)}</span></td>
      <td>${createStatusSelect(booking)}</td>
      <td>${createActions(booking)}</td>
    </tr>
  `).join("");

  mobileBookingsList.innerHTML = bookings.map((booking) => `
    <article class="mobile-booking-card">
      <div class="mobile-card-top">
        <div>
          <strong>${booking.clientName}</strong>
          <span class="table-sub-text">${booking.clientPhone || "Telefone não informado"}</span>
        </div>
        ${statusPill(booking.status)}
      </div>
      <div class="mobile-meta">
        <span><strong>Data:</strong> ${formatDateBR(booking.bookingDateIso)} · ${booking.time}</span>
        <span><strong>Serviço:</strong> ${booking.serviceName} · ${formatCurrency(booking.servicePriceValue)}</span>
        <span><strong>Profissional:</strong> ${booking.professionalName}</span>
        <span><strong>Código:</strong> ${booking.id}</span>
      </div>
      ${createStatusSelect(booking)}
      ${createActions(booking)}
    </article>
  `).join("");
}

function renderReports() {
  const range = getPeriodRange(state.report.period, state.report.date);
  const periodBookings = getBookingsInRange(range.startIso, range.endIso, true);
  const summary = summarizeBookings(periodBookings);

  reportRangeText.textContent = `Período selecionado: ${range.label}`;
  reportRevenue.textContent = formatCurrency(summary.revenue);
  reportCount.textContent = summary.count;
  reportCountHelp.textContent = summary.count === 1 ? "1 serviço no período" : `${summary.count} serviços no período`;
  reportAverageTicket.textContent = formatCurrency(summary.averageTicket);
  reportCanceled.textContent = summary.canceled;

  renderReportList(serviceReportList, groupBookings(periodBookings, (booking) => booking.serviceName), summary.revenue, "serviço");
  renderReportList(professionalReportList, groupBookings(periodBookings, (booking) => booking.professionalName), summary.revenue, "atendimento");
}

function renderReportList(container, items, totalRevenue, label) {
  if (!items.length) {
    container.innerHTML = `<div class="empty-state" style="display:block"><strong>Sem dados no período.</strong><p>Os dados aparecerão quando houver agendamentos válidos.</p></div>`;
    return;
  }

  container.innerHTML = items.map((item) => {
    const percent = totalRevenue ? Math.max(6, (item.revenue / totalRevenue) * 100) : 0;
    return `
      <div class="report-item" style="--bar-width:${percent}%">
        <div class="report-bar"></div>
        <div class="report-row">
          <div>
            <strong>${item.name}</strong>
            <span>${item.count} ${label}${item.count > 1 ? "s" : ""}</span>
          </div>
          <strong>${formatCurrency(item.revenue)}</strong>
        </div>
      </div>
    `;
  }).join("");
}

function render() {
  renderDashboard();
  renderBookings();
  renderReports();
}

function setActiveTab(tab) {
  state.currentTab = tab;
  tabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateBookingStatus(id, status) {
  state.bookings = state.bookings.map((booking) => (
    booking.id === id ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
  ));
  saveBookings();
  render();
}

function deleteBooking(id) {
  const booking = state.bookings.find((item) => item.id === id);
  const label = booking ? `${booking.clientName} - ${formatDateBR(booking.bookingDateIso)} ${booking.time}` : "este agendamento";
  if (!confirm(`Deseja excluir ${label}?`)) return;

  state.bookings = state.bookings.filter((booking) => booking.id !== id);
  saveBookings();
  render();
}

function populateManualForm() {
  manualProfessional.innerHTML = professionals.map((professional) => `<option value="${professional.id}">${professional.name}</option>`).join("");
  manualService.innerHTML = services.map((service) => `<option value="${service.id}">${service.name} · ${service.price}</option>`).join("");
  manualTime.innerHTML = availableTimes.map((time) => `<option value="${time}">${time}</option>`).join("");
  manualDate.value = todayIso();
  reportDate.value = state.report.date;
}

function addManualBooking(event) {
  event.preventDefault();

  const service = services.find((item) => item.id === manualService.value);
  const professional = professionals.find((item) => item.id === manualProfessional.value);
  const bookingDateIso = manualDate.value || todayIso();

  const booking = normalizeBooking({
    id: generateBookingId(),
    createdAt: new Date().toISOString(),
    bookingDateIso,
    dateLabel: "Manual",
    dateFormatted: formatDateShort(bookingDateIso),
    time: manualTime.value,
    professionalId: professional?.id,
    professionalName: professional?.name,
    serviceId: service?.id,
    serviceName: service?.name,
    serviceDuration: service?.duration,
    servicePrice: service?.price,
    servicePriceValue: service?.value,
    clientName: manualClientName.value.trim(),
    clientPhone: manualClientPhone.value.trim(),
    status: manualStatus.value,
    source: "Manual",
  });

  state.bookings = [booking, ...state.bookings].sort((a, b) => getBookingDateTime(a) - getBookingDateTime(b));
  saveBookings();
  manualBookingForm.reset();
  populateManualForm();
  render();
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => {
    const value = String(cell ?? "").replace(/"/g, '""');
    return `"${value}"`;
  }).join(";")).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportBookingsCsv(bookings, filename) {
  const rows = [
    ["Código", "Data", "Horário", "Cliente", "WhatsApp", "Serviço", "Profissional", "Valor", "Status", "Origem", "Criado em"],
    ...bookings.map((booking) => [
      booking.id,
      formatDateBR(booking.bookingDateIso),
      booking.time,
      booking.clientName,
      booking.clientPhone,
      booking.serviceName,
      booking.professionalName,
      formatCurrency(booking.servicePriceValue),
      booking.status,
      booking.source,
      booking.createdAt ? new Date(booking.createdAt).toLocaleString("pt-BR") : "",
    ]),
  ];

  downloadCsv(filename, rows);
}

function exportCurrentReportCsv() {
  const range = getPeriodRange(state.report.period, state.report.date);
  const bookings = getBookingsInRange(range.startIso, range.endIso, true);
  const periodLabel = state.report.period === "daily" ? "diario" : state.report.period === "weekly" ? "semanal" : "mensal";
  exportBookingsCsv(bookings, `relatorio-dk-barber-${periodLabel}-${range.startIso}-a-${range.endIso}.csv`);
}

function handleTableActions(event) {
  const target = event.target;
  const id = target.dataset.id;
  const action = target.dataset.action;

  if (!id || !action) return;

  if (action === "status") {
    updateBookingStatus(id, target.value);
  }

  if (action === "delete") {
    deleteBooking(id);
  }
}

function bindEvents() {
  tabs.forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));
  document.querySelectorAll("[data-go-tab]").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.goTab));
  });

  bookingSearch.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderBookings();
  });

  statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderBookings();
  });

  dateStartFilter.addEventListener("change", (event) => {
    state.filters.start = event.target.value;
    renderBookings();
  });

  dateEndFilter.addEventListener("change", (event) => {
    state.filters.end = event.target.value;
    renderBookings();
  });

  reportPeriod.addEventListener("change", (event) => {
    state.report.period = event.target.value;
    renderReports();
  });

  reportDate.addEventListener("change", (event) => {
    state.report.date = event.target.value || todayIso();
    renderReports();
  });

  bookingsTableBody.addEventListener("change", handleTableActions);
  bookingsTableBody.addEventListener("click", handleTableActions);
  mobileBookingsList.addEventListener("change", handleTableActions);
  mobileBookingsList.addEventListener("click", handleTableActions);
  manualBookingForm.addEventListener("submit", addManualBooking);
  exportAllButton.addEventListener("click", () => exportBookingsCsv(getFilteredBookings(), `agendamentos-dk-barber-${todayIso()}.csv`));
  exportReportButton.addEventListener("click", exportCurrentReportCsv);
}

function init() {
  state.bookings = loadBookings();
  populateManualForm();
  bindEvents();
  render();
}

init();

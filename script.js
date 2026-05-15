// Altere aqui as informações principais da barbearia.
const BARBERSHOP = {
  whatsappNumber: "5538999999999", // Troque para o número real. Exemplo: 5538999799827
  city: "Carbonita/MG",
};

const professionals = [
  {
    id: "denner",
    name: "Denner Kerlon",
    role: "Barbeiro especialista",
    initial: "D",
    note: "Mais procurado",
  },
  {
    id: "joao",
    name: "João Barber",
    role: "Corte e barba",
    initial: "J",
    note: "Disponível hoje",
  },
];

const services = [
  { id: "pe-barba", name: "PE + Barba", duration: "30 min", price: "R$ 20,00", icon: "✦" },
  { id: "cabelo", name: "Cabelo", duration: "40 min", price: "R$ 30,00", icon: "◆" },
  { id: "barba-cabelo", name: "Barba + Cabelo", duration: "1h", price: "R$ 45,00", icon: "★" },
  { id: "corte-pigmentacao", name: "Corte + Pigmentação", duration: "1h", price: "R$ 55,00", icon: "•" },
];

// Horários em intervalos de 30 minutos.
const availableTimes = [
  "07:00 - 07:30",
  "07:30 - 08:00",
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "12:00 - 12:30",
  "12:30 - 13:00",
  "13:00 - 13:30",
  "13:30 - 14:00",
  "14:00 - 14:30",
  "14:30 - 15:00",
  "15:00 - 15:30",
  "15:30 - 16:00",
  "16:00 - 16:30",
  "16:30 - 17:00",
  "17:00 - 17:30",
  "17:30 - 18:00",
  "18:00 - 18:30",
  "18:30 - 19:00",
  "19:00 - 19:30",
  "19:30 - 20:00",
];

// Clientes fixos: estes horários ficam indisponíveis automaticamente por dia da semana.
// 4 = quinta-feira | 5 = sexta-feira
const fixedUnavailableTimesByWeekday = {
  4: ["09:00", "16:30", "17:00", "18:00", "18:30"],
  5: ["08:00", "10:00", "13:00", "14:00", "16:00", "17:00", "17:30", "19:30"],
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameDay(firstDate, secondDate) {
  return toISODate(firstDate) === toISODate(secondDate);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getWeekday(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  }).format(date).replace(".", "");
}

function getMonthTitle(date) {
  return capitalize(
    new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(date)
  );
}

function getDayLabel(date) {
  const today = getTodayStart();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) return "Hoje";
  if (isSameDay(date, tomorrow)) return "Amanhã";

  return capitalize(
    new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
    }).format(date)
  );
}

function getTimeStart(timeRange) {
  return timeRange.split("-")[0].trim();
}

const state = {
  currentStep: 0,
  professionalId: "denner",
  serviceId: "pe-barba",
  calendarDate: getMonthStart(new Date()),
  dayIso: toISODate(new Date()),
  time: "07:00 - 07:30",
  clientName: "",
  clientPhone: "",
};

const screens = document.querySelectorAll(".screen");
const progressFill = document.getElementById("progressFill");
const stepLabels = document.querySelectorAll(".step-label");
const professionalsList = document.getElementById("professionalsList");
const servicesList = document.getElementById("servicesList");
const daysList = document.getElementById("daysList");
const timesList = document.getElementById("timesList");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const footerActions = document.getElementById("footerActions");
const clientName = document.getElementById("clientName");
const clientPhone = document.getElementById("clientPhone");
const whatsappLink = document.getElementById("whatsappLink");
const cancelLink = document.getElementById("cancelLink");
const newBookingButton = document.getElementById("newBookingButton");
const scheduleSubtitle = document.getElementById("scheduleSubtitle");

function getSelectedProfessional() {
  return professionals.find((item) => item.id === state.professionalId);
}

function getSelectedService() {
  return services.find((item) => item.id === state.serviceId);
}

function isSelectedDayAvailable() {
  if (!state.dayIso) return false;
  const selectedDate = parseISODate(state.dayIso);
  return selectedDate >= getTodayStart();
}

function getSelectedDay() {
  if (!state.dayIso) return null;

  const selectedDate = parseISODate(state.dayIso);

  return {
    id: state.dayIso,
    iso: state.dayIso,
    label: getDayLabel(selectedDate),
    weekday: getWeekday(selectedDate),
    date: formatDate(selectedDate),
    fullDate: selectedDate,
  };
}

function getFixedUnavailableTimesForSelectedDay() {
  const selectedDay = getSelectedDay();
  if (!selectedDay) return [];

  return fixedUnavailableTimesByWeekday[selectedDay.fullDate.getDay()] || [];
}

function isTimeUnavailable(timeRange) {
  return getFixedUnavailableTimesForSelectedDay().includes(getTimeStart(timeRange));
}

function getFirstAvailableTimeForSelectedDay() {
  return availableTimes.find((time) => !isTimeUnavailable(time)) || "";
}

function ensureSelectedTimeIsAvailable() {
  if (!state.time || isTimeUnavailable(state.time)) {
    state.time = getFirstAvailableTimeForSelectedDay();
  }
}

function renderProfessionals() {
  professionalsList.innerHTML = professionals.map((item) => `
    <button type="button" class="option-card professional-card ${state.professionalId === item.id ? "selected" : ""}" data-professional-id="${item.id}">
      <span class="avatar">${item.initial}</span>
      <span class="option-main">
        <strong>${item.name}</strong>
        <small>${item.role}</small>
        <span class="option-note">${item.note}</span>
      </span>
      <span class="arrow">›</span>
    </button>
  `).join("");

  document.querySelectorAll("[data-professional-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.professionalId = button.dataset.professionalId;
      renderProfessionals();
      updateUI();
    });
  });
}

function renderServices() {
  servicesList.innerHTML = services.map((item) => `
    <button type="button" class="option-card service-card ${state.serviceId === item.id ? "selected" : ""}" data-service-id="${item.id}">
      <span class="service-left">
        <span class="service-icon">${item.icon}</span>
        <span class="option-main">
          <strong>${item.name}</strong>
          <small>${item.duration} de atendimento</small>
        </span>
      </span>
      <span class="price">${item.price}</span>
    </button>
  `).join("");

  document.querySelectorAll("[data-service-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.serviceId = button.dataset.serviceId;
      renderServices();
      updateUI();
    });
  });
}

function getCalendarCells() {
  const monthStart = getMonthStart(state.calendarDate);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekDay = monthStart.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekDay + daysInMonth) / 7) * 7;
  const today = getTodayStart();

  return Array.from({ length: totalCells }).map((_, index) => {
    const calendarDay = index - firstWeekDay + 1;
    const date = new Date(year, month, calendarDay);
    date.setHours(0, 0, 0, 0);

    const isOutsideMonth = date.getMonth() !== month;
    const isPast = date < today;
    const isoDate = toISODate(date);

    return {
      date,
      isoDate,
      dayNumber: date.getDate(),
      isOutsideMonth,
      isPast,
      isToday: isSameDay(date, today),
      isSelected: state.dayIso === isoDate,
      isDisabled: isOutsideMonth || isPast,
    };
  });
}

function renderDays() {
  const monthStart = getMonthStart(state.calendarDate);
  const previousMonthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), 0);
  previousMonthEnd.setHours(0, 0, 0, 0);
  const canGoPrevious = previousMonthEnd >= getTodayStart();
  const selectedDay = getSelectedDay();
  const calendarCells = getCalendarCells();

  daysList.innerHTML = `
    <div class="calendar-widget" aria-label="Calendário de agendamento">
      <div class="calendar-topbar">
        <button type="button" class="calendar-nav-button" data-calendar-nav="prev" ${canGoPrevious ? "" : "disabled"} aria-label="Mês anterior">‹</button>
        <div class="calendar-title-wrap">
          <strong>${getMonthTitle(monthStart)}</strong>
          <span>Dias anteriores ficam bloqueados automaticamente</span>
        </div>
        <button type="button" class="calendar-nav-button" data-calendar-nav="next" aria-label="Próximo mês">›</button>
      </div>

      <div class="calendar-weekdays" aria-hidden="true">
        ${weekDays.map((day) => `<span>${day}</span>`).join("")}
      </div>

      <div class="calendar-month-grid">
        ${calendarCells.map((item) => `
          <button
            type="button"
            class="calendar-day ${item.isSelected ? "selected" : ""} ${item.isToday ? "is-today" : ""} ${item.isPast ? "is-past" : ""} ${item.isOutsideMonth ? "is-outside" : ""}"
            data-date="${item.isoDate}"
            ${item.isDisabled ? "disabled" : ""}
            aria-label="${item.isDisabled ? "Indisponível" : "Selecionar"} ${formatDate(item.date)}"
          >
            <span class="calendar-day-number">${item.dayNumber}</span>
            ${item.isToday ? `<small>Hoje</small>` : ""}
          </button>
        `).join("")}
      </div>

      <div class="calendar-selected-line">
        <span>Selecionado</span>
        <strong>${selectedDay ? `${selectedDay.label}, ${selectedDay.date}` : "Escolha uma data"}</strong>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-calendar-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.calendarNav === "next" ? 1 : -1;
      state.calendarDate = getMonthStart(new Date(
        state.calendarDate.getFullYear(),
        state.calendarDate.getMonth() + direction,
        1
      ));
      renderDays();
    });
  });

  document.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      state.dayIso = button.dataset.date;
      ensureSelectedTimeIsAvailable();
      renderDays();
      renderTimes();
      updateUI();
    });
  });
}

function renderTimes() {
  ensureSelectedTimeIsAvailable();

  timesList.innerHTML = availableTimes.map((time) => {
    const unavailable = isTimeUnavailable(time);
    return `
      <button
        type="button"
        class="time-button ${state.time === time ? "selected" : ""} ${unavailable ? "unavailable" : ""}"
        data-time="${time}"
        ${unavailable ? "disabled" : ""}
        aria-label="${unavailable ? "Horário indisponível" : "Selecionar horário"} ${time}"
      >
        <span>${time}</span>
        ${unavailable ? "<small>Cliente fixo</small>" : ""}
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-time]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      state.time = button.dataset.time;
      renderTimes();
      updateUI();
    });
  });
}

function isCurrentStepValid() {
  if (state.currentStep === 0) return Boolean(state.professionalId);
  if (state.currentStep === 1) return Boolean(state.serviceId);
  if (state.currentStep === 2) return Boolean(state.dayIso && isSelectedDayAvailable() && state.time && !isTimeUnavailable(state.time));
  if (state.currentStep === 3) {
    const nameOk = state.clientName.trim().length >= 3;
    const phoneDigits = state.clientPhone.replace(/\D/g, "");
    const phoneOk = phoneDigits.length >= 10;
    return nameOk && phoneOk;
  }
  return true;
}

function updateSummary() {
  const professional = getSelectedProfessional();
  const service = getSelectedService();
  const day = getSelectedDay();

  document.getElementById("summaryProfessional").textContent = professional ? `Profissional: ${professional.name}` : "";
  document.getElementById("summaryService").textContent = service ? `Serviço: ${service.name} · ${service.price}` : "";
  document.getElementById("summaryDate").textContent = day ? `Data: ${day.label}, ${day.date} às ${state.time}` : "";

  document.getElementById("finalProfessional").textContent = professional ? `Profissional: ${professional.name}` : "";
  document.getElementById("finalService").textContent = service ? `Serviço: ${service.name} · ${service.price}` : "";
  document.getElementById("finalDate").textContent = day ? `Data: ${day.label}, ${day.date} às ${state.time}` : "";
  document.getElementById("finalClient").textContent = `Cliente: ${state.clientName} · ${state.clientPhone}`;

  if (professional) {
    scheduleSubtitle.textContent = `Escolha uma data disponível no calendário para ${professional.name}.`;
  }
}

function buildBookingWhatsAppUrl() {
  const professional = getSelectedProfessional();
  const service = getSelectedService();
  const day = getSelectedDay();
  const cancelUrl = buildCancelWhatsAppUrl();

  const message = encodeURIComponent(
    `Olá, DK Barber Club! 

` +
    `Acabei de realizar um agendamento pelo site e gostaria de confirmar minha reserva.

` +
    `📅 Dados do agendamento
` +
    `Profissional: ${professional?.name || ""}
` +
    `Serviço: ${service?.name || ""}
` +
    `Valor: ${service?.price || ""}
` +
    `Data: ${day?.label || ""} - ${day?.date || ""}
` +
    `Horário: ${state.time}

` +
    `👤 Dados do cliente
` +
    `Nome: ${state.clientName}
` +
    `WhatsApp: ${state.clientPhone}

` +
    `Status: aguardando confirmação da barbearia.

` +
    `Caso precise cancelar este agendamento, use o link abaixo:
` +
    `${cancelUrl}

` +
    `Obrigado!`
  );

  return `https://wa.me/${BARBERSHOP.whatsappNumber}?text=${message}`;
}

function buildCancelWhatsAppUrl() {
  const professional = getSelectedProfessional();
  const service = getSelectedService();
  const day = getSelectedDay();

  const message = encodeURIComponent(
    `Olá, DK Barber Club! 

` +
    `Gostaria de solicitar o cancelamento do meu agendamento.

` +
    `📅 Dados do agendamento
` +
    `Profissional: ${professional?.name || ""}
` +
    `Serviço: ${service?.name || ""}
` +
    `Valor: ${service?.price || ""}
` +
    `Data: ${day?.label || ""} - ${day?.date || ""}
` +
    `Horário: ${state.time}

` +
    `👤 Dados do cliente
` +
    `Nome: ${state.clientName}
` +
    `WhatsApp: ${state.clientPhone}

` +
    `Status: cancelamento solicitado pelo cliente.

` +
    `Obrigado pela atenção.`
  );

  return `https://wa.me/${BARBERSHOP.whatsappNumber}?text=${message}`;
}

function updateWhatsAppLinks() {
  whatsappLink.href = buildBookingWhatsAppUrl();
  cancelLink.href = buildCancelWhatsAppUrl();
}

function notifyBarbershopOnFinish() {
  updateWhatsAppLinks();

  // Importante: o navegador/WhatsApp não permite envio 100% automático.
  // Ao finalizar, o sistema abre a conversa da barbearia com a mensagem pronta.
  // A pessoa só precisa tocar em "Enviar" no WhatsApp.
  const whatsappWindow = window.open(whatsappLink.href, "_blank", "noopener");

  if (!whatsappWindow) {
    whatsappLink.focus();
  }
}

function updateUI() {
  screens.forEach((screen) => {
    screen.classList.toggle("active", Number(screen.dataset.screen) === state.currentStep);
  });

  stepLabels.forEach((label) => {
    const step = Number(label.dataset.stepLabel);
    label.classList.toggle("active", step === state.currentStep);
    label.classList.toggle("done", step < state.currentStep);
  });

  progressFill.style.width = `${((Math.min(state.currentStep, 3) + 1) / 4) * 100}%`;
  backButton.classList.toggle("hidden", state.currentStep === 0);
  nextButton.disabled = !isCurrentStepValid();
  nextButton.innerHTML = state.currentStep === 3 ? "Finalizar agendamento <span>›</span>" : "Continuar <span>›</span>";
  footerActions.style.display = state.currentStep === 4 ? "none" : "block";

  updateSummary();
  updateWhatsAppLinks();
}

function goNext() {
  if (!isCurrentStepValid()) {
    const activeScreen = document.querySelector(".screen.active");
    activeScreen.classList.remove("error-shake");
    void activeScreen.offsetWidth;
    activeScreen.classList.add("error-shake");
    return;
  }

  if (state.currentStep < 3) {
    state.currentStep += 1;
    window.scrollTo({ top: 0, behavior: "smooth" });
    updateUI();
    return;
  }

  state.currentStep = 4;
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateUI();
  notifyBarbershopOnFinish();
}

function goBack() {
  if (state.currentStep > 0) {
    state.currentStep -= 1;
    updateUI();
  }
}

function resetBooking() {
  state.currentStep = 0;
  state.professionalId = "denner";
  state.serviceId = "pe-barba";
  state.calendarDate = getMonthStart(new Date());
  state.dayIso = toISODate(new Date());
  state.time = "07:00 - 07:30";
  ensureSelectedTimeIsAvailable();
  state.clientName = "";
  state.clientPhone = "";
  clientName.value = "";
  clientPhone.value = "";
  renderProfessionals();
  renderServices();
  renderDays();
  renderTimes();
  updateUI();
}

clientName.addEventListener("input", (event) => {
  state.clientName = event.target.value;
  updateUI();
});

clientPhone.addEventListener("input", (event) => {
  let value = event.target.value.replace(/\D/g, "").slice(0, 11);

  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{1})(\d{4})(\d{4}).*/, "($1) $2 $3-$4");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (value.length > 0) {
    value = value.replace(/^(\d*)/, "($1");
  }

  event.target.value = value;
  state.clientPhone = value;
  updateUI();
});

nextButton.addEventListener("click", goNext);
backButton.addEventListener("click", goBack);
newBookingButton.addEventListener("click", resetBooking);

renderProfessionals();
renderServices();
renderDays();
renderTimes();
updateUI();

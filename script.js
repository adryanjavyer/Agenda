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
  { id: "corte", name: "Corte masculino", duration: "40 min", price: "R$ 35", icon: "✦" },
  { id: "barba", name: "Barba premium", duration: "30 min", price: "R$ 25", icon: "◆" },
  { id: "combo", name: "Corte + barba", duration: "1h", price: "R$ 55", icon: "★" },
  { id: "sobrancelha", name: "Sobrancelha", duration: "15 min", price: "R$ 15", icon: "•" },
];

const availableTimes = [
  "08:00", "08:40", "09:20",
  "10:00", "10:40", "11:20",
  "13:00", "13:40", "14:20",
  "15:00", "15:40", "16:20",
  "17:00", "17:40", "18:20",
];

const state = {
  currentStep: 0,
  professionalId: "denner",
  serviceId: "combo",
  dayId: "day-1",
  time: "10:40",
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
const newBookingButton = document.getElementById("newBookingButton");
const scheduleSubtitle = document.getElementById("scheduleSubtitle");

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

function getAvailableDays() {
  const today = new Date();

  return Array.from({ length: 4 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    let label = getWeekday(date);
    if (index === 0) label = "Hoje";
    if (index === 1) label = "Amanhã";

    return {
      id: `day-${index}`,
      label,
      weekday: getWeekday(date),
      date: formatDate(date),
    };
  });
}

function getSelectedProfessional() {
  return professionals.find((item) => item.id === state.professionalId);
}

function getSelectedService() {
  return services.find((item) => item.id === state.serviceId);
}

function getSelectedDay() {
  return getAvailableDays().find((item) => item.id === state.dayId);
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

function renderDays() {
  const days = getAvailableDays();

  daysList.innerHTML = days.map((item) => `
    <button type="button" class="day-button ${state.dayId === item.id ? "selected" : ""}" data-day-id="${item.id}">
      <small>${item.weekday}</small>
      <strong>${item.date}</strong>
      <span>${item.label}</span>
    </button>
  `).join("");

  document.querySelectorAll("[data-day-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayId = button.dataset.dayId;
      renderDays();
      updateUI();
    });
  });
}

function renderTimes() {
  timesList.innerHTML = availableTimes.map((time) => `
    <button type="button" class="time-button ${state.time === time ? "selected" : ""}" data-time="${time}">
      ${time}
    </button>
  `).join("");

  document.querySelectorAll("[data-time]").forEach((button) => {
    button.addEventListener("click", () => {
      state.time = button.dataset.time;
      renderTimes();
      updateUI();
    });
  });
}

function isCurrentStepValid() {
  if (state.currentStep === 0) return Boolean(state.professionalId);
  if (state.currentStep === 1) return Boolean(state.serviceId);
  if (state.currentStep === 2) return Boolean(state.dayId && state.time);
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
    scheduleSubtitle.textContent = `Horários disponíveis para ${professional.name}.`;
  }
}

function updateWhatsAppLink() {
  const professional = getSelectedProfessional();
  const service = getSelectedService();
  const day = getSelectedDay();

  const message = encodeURIComponent(
    `Olá! Quero confirmar meu agendamento:\n\n` +
    `Profissional: ${professional?.name || ""}\n` +
    `Serviço: ${service?.name || ""}\n` +
    `Valor: ${service?.price || ""}\n` +
    `Dia: ${day?.label || ""} - ${day?.date || ""}\n` +
    `Horário: ${state.time}\n` +
    `Nome: ${state.clientName}\n` +
    `WhatsApp: ${state.clientPhone}`
  );

  whatsappLink.href = `https://wa.me/${BARBERSHOP.whatsappNumber}?text=${message}`;
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
  updateWhatsAppLink();
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
  } else {
    state.currentStep = 4;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  updateUI();
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
  state.serviceId = "combo";
  state.dayId = "day-1";
  state.time = "10:40";
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

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = $("[data-header]");
const menu = $("[data-menu]");
const menuToggle = $("[data-menu-toggle]");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Отвори менюто" : "Затвори менюто");
  menu?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Отвори менюто");
    menu?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

const navSections = ["solutions", "product", "how-it-works", "roi", "contact"];
const navLinks = $$(".primary-nav a");

if ("IntersectionObserver" in window) {
  const activeNavigationObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-current", link.getAttribute("href") === `#${visibleEntry.target.id}`);
      });
    },
    { rootMargin: "-20% 0px -65%", threshold: [0, 0.2, 0.5] },
  );

  navSections.forEach((id) => {
    const section = document.getElementById(id);
    if (section) activeNavigationObserver.observe(section);
  });
}

const revealElements = $$(".reveal");
revealElements.forEach((element) => {
  const delay = Number(element.dataset.delay || 0);
  element.style.setProperty("--reveal-delay", `${delay}ms`);
});

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px" },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const cityData = {
  sofia: { label: "София", lat: 42.6977, lon: 23.3219 },
  plovdiv: { label: "Пловдив", lat: 42.1354, lon: 24.7453 },
  ruse: { label: "Русе", lat: 43.8356, lon: 25.9657 },
  varna: { label: "Варна", lat: 43.2141, lon: 27.9147 },
  burgas: { label: "Бургас", lat: 42.5048, lon: 27.4626 },
  bucharest: { label: "Букурещ", lat: 44.4268, lon: 26.1025 },
  thessaloniki: { label: "Солун", lat: 40.6401, lon: 22.9444 },
  berlin: { label: "Берлин", lat: 52.52, lon: 13.405 },
  munich: { label: "Мюнхен", lat: 48.1351, lon: 11.582 },
  vienna: { label: "Виена", lat: 48.2082, lon: 16.3738 },
  budapest: { label: "Будапеща", lat: 47.4979, lon: 19.0402 },
  prague: { label: "Прага", lat: 50.0755, lon: 14.4378 },
  istanbul: { label: "Истанбул", lat: 41.0082, lon: 28.9784 },
};

const truckData = {
  euro6: { consumption: 31.5, rate: 1.48, speed: 73, driverKm: 0.23 },
  reefer: { consumption: 35.5, rate: 1.68, speed: 70, driverKm: 0.24 },
  van: { consumption: 11.5, rate: 0.91, speed: 76, driverKm: 0.18 },
};

const cargoData = {
  general: { multiplier: 1, toll: 0.145 },
  chilled: { multiplier: 1.12, toll: 0.15 },
  adr: { multiplier: 1.2, toll: 0.16 },
};

const drivers = [
  { name: "Иван Петров", initials: "ИП" },
  { name: "Елена Стоянова", initials: "ЕС" },
  { name: "Николай Иванов", initials: "НИ" },
  { name: "Димитър Колев", initials: "ДК" },
];

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistance = (from, to) => {
  const earthRadius = 6371;
  const latitudeDelta = toRadians(to.lat - from.lat);
  const longitudeDelta = toRadians(to.lon - from.lon);
  const fromLatitude = toRadians(from.lat);
  const toLatitude = toRadians(to.lat);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(value));
};

const numberFormatter = new Intl.NumberFormat("bg-BG", { maximumFractionDigits: 0 });
const formatInteger = (value) => numberFormatter.format(Math.round(value));
const formatEuro = (value) => `${formatInteger(value)} €`;

const routeForm = $("#route-form");
const routeDate = $("#route-date");

if (routeDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  routeDate.min = new Date().toISOString().split("T")[0];
  routeDate.value = tomorrow.toISOString().split("T")[0];
}

const calculateRoute = () => {
  const fromKey = $("#from-city")?.value;
  const toKey = $("#to-city")?.value;
  const truckKey = $("#truck-type")?.value;
  const cargoKey = $("#cargo-type")?.value;

  if (!fromKey || !toKey || !truckKey || !cargoKey) return;

  const toSelect = $("#to-city");
  if (fromKey === toKey) {
    toSelect?.setCustomValidity("Изберете различен краен град.");
    toSelect?.reportValidity();
    return;
  }
  toSelect?.setCustomValidity("");

  const from = cityData[fromKey];
  const to = cityData[toKey];
  const truck = truckData[truckKey];
  const cargo = cargoData[cargoKey];

  const distance = Math.max(80, Math.round(haversineDistance(from, to) * 1.24));
  const fuelLiters = (distance * truck.consumption) / 100;
  const fuelCost = fuelLiters * 1.55;
  const tollCost = distance * cargo.toll;
  const restHours = Math.floor(distance / 700) * 9;
  const travelHours = distance / truck.speed + restHours;
  const driverCost = distance * truck.driverKm + 85;
  const revenue = distance * truck.rate * cargo.multiplier + 145;
  const profit = Math.max(0, revenue - fuelCost - tollCost - driverCost);
  const margin = Math.max(0, Math.round((profit / revenue) * 100));
  const driverIndex = Math.abs(
    [...`${fromKey}${toKey}${truckKey}${cargoKey}`].reduce((total, character) => total + character.charCodeAt(0), 0),
  ) % drivers.length;
  const driver = drivers[driverIndex];
  const score = 93 + (driverIndex % 5);
  const wholeHours = Math.floor(travelHours);
  const minutes = Math.round((travelHours - wholeHours) * 60 / 5) * 5;
  const displayHours = wholeHours + (minutes === 60 ? 1 : 0);
  const displayMinutes = minutes === 60 ? 0 : minutes;

  $("#suggested-driver").textContent = driver.name;
  $("#driver-initials").textContent = driver.initials;
  $("#route-distance").textContent = `${formatInteger(distance)} км`;
  $("#fuel-cost").textContent = formatEuro(fuelCost);
  $("#toll-cost").textContent = formatEuro(tollCost);
  $("#travel-time").textContent = `${displayHours} ч ${displayMinutes} мин`;
  $("#expected-profit").textContent = `+${formatEuro(profit)}`;
  $("#profit-margin").textContent = `${margin}% марж`;

  const fitScore = $(".fit-score");
  if (fitScore) fitScore.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${score}% съвпадение`;

  const results = $(".route-results");
  results?.classList.remove("is-updating");
  void results?.offsetWidth;
  results?.classList.add("is-updating");
};

routeForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = $(".demo-submit", routeForm);
  const icon = $("i", button);
  button?.classList.add("is-loading");
  if (icon) icon.className = "fa-solid fa-spinner";

  window.setTimeout(() => {
    calculateRoute();
    button?.classList.remove("is-loading");
    if (icon) icon.className = "fa-solid fa-wand-magic-sparkles";
  }, reducedMotion ? 0 : 420);
});

const workflowItems = [
  {
    status: "Нова заявка",
    icon: "fa-route",
    title: "Създаване на транспортна заявка",
    description: "Маршрут, товар и срок са записани.",
    cost: "—",
    profit: "—",
  },
  {
    status: "Ресурсите са избрани",
    icon: "fa-user-check",
    title: "Най-подходящият шофьор е намерен",
    description: "Иван Петров · 96% съвпадение · документи валидни.",
    cost: "—",
    profit: "—",
  },
  {
    status: "Документите са готови",
    icon: "fa-file-signature",
    title: "CMR е генериран автоматично",
    description: "Изпращач, получател, товар и превозвач са попълнени.",
    cost: "—",
    profit: "—",
  },
  {
    status: "Документът е разпознат",
    icon: "fa-file-invoice",
    title: "OCR прочете разходната фактура",
    description: "Номер, доставчик, дата и сума са свързани с курса.",
    cost: "795 €",
    profit: "—",
  },
  {
    status: "Финансите са отчетени",
    icon: "fa-coins",
    title: "Всички разходи са събрани",
    description: "Гориво, тол такси и командировъчни — 1 680 € общо.",
    cost: "1 680 €",
    profit: "—",
  },
  {
    status: "Курсът е завършен",
    icon: "fa-chart-line",
    title: "Финансовият резултат е готов",
    description: "Приход 2 540 € · разход 1 680 € · марж 34%.",
    cost: "1 680 €",
    profit: "+860 €",
  },
];

const workflowSteps = $$("[data-workflow-step]");
const workflowStatus = $("[data-workflow-status]");
const workflowCost = $("[data-workflow-cost]");
const workflowProfit = $("[data-workflow-profit]");
const workflowEvent = $("[data-workflow-event]");
const workflowProgress = $("[data-workflow-progress]");
const workflowToggle = $("[data-workflow-toggle]");
let workflowIndex = 0;
let workflowPaused = reducedMotion;
let workflowTimer;

const restartWorkflowTimer = () => {
  window.clearTimeout(workflowTimer);
  workflowProgress?.classList.remove("is-running");
  void workflowProgress?.offsetWidth;

  if (workflowPaused) return;
  workflowProgress?.classList.add("is-running");
  workflowTimer = window.setTimeout(() => {
    setWorkflowStep((workflowIndex + 1) % workflowItems.length);
  }, 5000);
};

const setWorkflowStep = (index) => {
  workflowIndex = index;
  const item = workflowItems[index];

  workflowSteps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === index);
    step.classList.toggle("is-complete", stepIndex < index);
  });

  if (workflowStatus) workflowStatus.textContent = item.status;
  if (workflowCost) workflowCost.textContent = item.cost;
  if (workflowProfit) workflowProfit.textContent = item.profit;

  if (workflowEvent) {
    const icon = $(".event-icon i", workflowEvent);
    const title = $("strong", workflowEvent);
    const description = $("p", workflowEvent);
    if (icon) icon.className = `fa-solid ${item.icon}`;
    if (title) title.textContent = item.title;
    if (description) description.textContent = item.description;
    workflowEvent.animate(
      [{ opacity: 0.45, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: reducedMotion ? 1 : 280, easing: "ease-out" },
    );
  }

  restartWorkflowTimer();
};

workflowSteps.forEach((step) => {
  step.addEventListener("click", () => setWorkflowStep(Number(step.dataset.workflowStep)));
});

workflowToggle?.addEventListener("click", () => {
  workflowPaused = !workflowPaused;
  workflowToggle.setAttribute("aria-pressed", String(workflowPaused));
  const icon = $("i", workflowToggle);
  const label = $("span", workflowToggle);
  if (icon) icon.className = workflowPaused ? "fa-solid fa-play" : "fa-solid fa-pause";
  if (label) label.textContent = workflowPaused ? "Продължи" : "Пауза";
  restartWorkflowTimer();
});

setWorkflowStep(0);

const screenTabs = $$("[data-screen]");
const productSlides = $$("[data-screen-slide]");
const productStory = $("#product-story");
const productSticky = $(".product-sticky", productStory || document);
const productProgressFill = $("#product-progress-fill");
let productFrame = 0;

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));

const setProductFrame = (progress) => {
  if (!productSlides.length) return;

  const timeline = progress * (productSlides.length - 1);
  const activeIndex = Math.round(timeline);

  productSlides.forEach((slide, index) => {
    const offset = index - timeline;
    const distance = Math.min(Math.abs(offset), 1);
    const translate = offset * 104;
    const scale = 1 - distance * 0.045;
    const rotation = clamp(offset, -1, 1) * -1.8;

    slide.style.opacity = String(clamp(1 - Math.max(0, Math.abs(offset) - 0.78) * 4));
    slide.style.transform = `translate3d(${translate}%, 0, 0) scale(${scale}) rotateY(${rotation}deg)`;
    slide.style.filter = `saturate(${1 - distance * 0.18}) brightness(${1 - distance * 0.08})`;
    slide.style.zIndex = String(productSlides.length - Math.round(distance * productSlides.length));

    const isActive = index === activeIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  screenTabs.forEach((tab, index) => {
    const isActive = index === activeIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  if (productProgressFill) {
    productProgressFill.style.transform = `scaleX(${progress})`;
  }
};

const getProductScrollMetrics = () => {
  if (!productStory || !productSticky) return null;

  const storyTop = productStory.getBoundingClientRect().top + window.scrollY;
  const stickyTop = Number.parseFloat(window.getComputedStyle(productSticky).top) || 0;
  const start = storyTop - stickyTop;
  const distance = Math.max(1, productStory.offsetHeight - productSticky.offsetHeight);

  return { start, distance };
};

const updateProductFromScroll = () => {
  productFrame = 0;
  const metrics = getProductScrollMetrics();
  if (!metrics) return;
  setProductFrame(clamp((window.scrollY - metrics.start) / metrics.distance));
};

const requestProductUpdate = () => {
  if (productFrame) return;
  productFrame = window.requestAnimationFrame(updateProductFromScroll);
};

screenTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const index = screenTabs.indexOf(tab);
    const metrics = getProductScrollMetrics();
    if (!metrics || index < 0) return;

    const targetProgress = productSlides.length > 1 ? index / (productSlides.length - 1) : 0;
    window.scrollTo({
      top: metrics.start + metrics.distance * targetProgress,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  });
});

window.addEventListener("scroll", requestProductUpdate, { passive: true });
window.addEventListener("resize", requestProductUpdate);
updateProductFromScroll();

const roiInputs = [
  { input: $("#roi-trucks"), output: $("#roi-trucks-output") },
  { input: $("#roi-drivers"), output: $("#roi-drivers-output") },
  { input: $("#roi-trips"), output: $("#roi-trips-output") },
];

const updateRangeProgress = (input) => {
  const minimum = Number(input.min || 0);
  const maximum = Number(input.max || 100);
  const progress = ((Number(input.value) - minimum) / (maximum - minimum)) * 100;
  input.style.setProperty("--range-progress", `${progress}%`);
};

const updateRoi = () => {
  const trucks = Number($("#roi-trucks")?.value || 10);
  const driversCount = Number($("#roi-drivers")?.value || 12);
  const trips = Number($("#roi-trips")?.value || 150);
  const savedHours = Math.round(trips * 0.22 + driversCount * 0.4 + trucks * 0.45);
  const savedCosts = Math.round(trips * 6 + trucks * 35 + driversCount * 12.5);
  const profitEffect = Math.round(trips * 18 + trucks * 35 + driversCount * 12.5);

  $("#roi-time").textContent = `${formatInteger(savedHours)} часа`;
  $("#roi-savings").textContent = formatEuro(savedCosts);
  $("#roi-profit").textContent = `+${formatEuro(profitEffect)}`;
};

roiInputs.forEach(({ input, output }) => {
  if (!input || !output) return;
  updateRangeProgress(input);
  input.addEventListener("input", () => {
    output.textContent = formatInteger(Number(input.value));
    updateRangeProgress(input);
    updateRoi();
  });
});

updateRoi();

const contactForm = $(".contact-form");
contactForm?.addEventListener("submit", () => {
  const submitButton = $('button[type="submit"]', contactForm);
  if (!submitButton) return;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Изпращане...';
});

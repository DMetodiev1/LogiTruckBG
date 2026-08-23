(() => {
  const measurementId = "G-CVNNGD3BB3";
  const consentKey = "logitruck_analytics_consent";
  const validConsent = new Set(["granted", "denied"]);

  const readCookie = () => document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${consentKey}=`))
    ?.split("=")[1];

  const readConsent = () => {
    const cookieValue = readCookie();
    if (validConsent.has(cookieValue)) return cookieValue;
    try {
      const storedValue = window.localStorage.getItem(consentKey);
      return validConsent.has(storedValue) ? storedValue : null;
    } catch {
      return null;
    }
  };

  const saveConsent = (value) => {
    const domain = location.hostname.endsWith("lumina-88.com") ? "; Domain=.lumina-88.com" : "";
    document.cookie = `${consentKey}=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure${domain}`;
    try { window.localStorage.setItem(consentKey, value); } catch { /* Cookie remains the shared source. */ }
  };

  let loaded = false;
  const loadAnalytics = () => {
    if (loaded || readConsent() !== "granted") return;
    if (!window.location.hostname.endsWith("lumina-88.com")) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { cookie_domain: "lumina-88.com", anonymize_ip: true });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  };

  const track = (eventName, parameters = {}) => {
    if (readConsent() !== "granted") return;
    loadAnalytics();
    window.gtag?.("event", eventName, parameters);
  };

  const dialog = document.createElement("div");
  dialog.className = "cookie-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `<section class="cookie-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
    <h2 id="cookie-title">Помогнете ни да подобрим LogiTruck</h2>
    <p>Използваме незадължителни аналитични бисквитки само след вашето съгласие. Те ни помагат да разберем кои публични страници и действия са полезни. Можете да промените избора си от връзката в долната част на сайта.</p>
    <div class="cookie-actions"><button type="button" data-cookie-deny>Отказвам</button><button class="accept" type="button" data-cookie-accept>Приемам аналитичните</button></div>
  </section>`;
  document.body.append(dialog);

  let lastFocused = null;
  const openDialog = () => {
    lastFocused = document.activeElement;
    dialog.hidden = false;
    dialog.querySelector("button")?.focus();
  };
  const closeDialog = () => {
    dialog.hidden = true;
    lastFocused?.focus?.();
  };
  const choose = (value) => {
    saveConsent(value);
    closeDialog();
    if (value === "granted") loadAnalytics();
  };

  dialog.querySelector("[data-cookie-deny]")?.addEventListener("click", () => choose("denied"));
  dialog.querySelector("[data-cookie-accept]")?.addEventListener("click", () => choose("granted"));
  document.querySelectorAll("[data-cookie-settings]").forEach((button) => button.addEventListener("click", openDialog));
  dialog.addEventListener("keydown", (event) => { if (event.key === "Escape" && readConsent()) closeDialog(); });

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-analytics-event]");
    if (!target) return;
    track(target.dataset.analyticsEvent, { link_url: target.href || undefined, link_text: target.textContent.trim().slice(0, 100) });
  });
  document.querySelector(".contact-form")?.addEventListener("submit", () => track("generate_lead", { method: "contact_form" }));

  window.LogiTruckAnalytics = { track, openPreferences: openDialog, consent: readConsent };
  if (readConsent() === "granted") loadAnalytics();
  if (!readConsent()) openDialog();
})();

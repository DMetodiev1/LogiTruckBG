const contentMenu = document.querySelector("[data-menu]");
const contentMenuToggle = document.querySelector("[data-menu-toggle]");

contentMenuToggle?.addEventListener("click", () => {
  const open = contentMenuToggle.getAttribute("aria-expanded") === "true";
  contentMenuToggle.setAttribute("aria-expanded", String(!open));
  const english = document.documentElement.lang === "en";
  contentMenuToggle.setAttribute("aria-label", open ? (english ? "Open menu" : "Отвори менюто") : (english ? "Close menu" : "Затвори менюто"));
  contentMenu?.classList.toggle("is-open", !open);
  document.body.classList.toggle("menu-open", !open);
});

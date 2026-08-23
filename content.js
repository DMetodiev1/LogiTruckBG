const contentMenu = document.querySelector("[data-menu]");
const contentMenuToggle = document.querySelector("[data-menu-toggle]");

contentMenuToggle?.addEventListener("click", () => {
  const open = contentMenuToggle.getAttribute("aria-expanded") === "true";
  contentMenuToggle.setAttribute("aria-expanded", String(!open));
  contentMenuToggle.setAttribute("aria-label", open ? "Отвори менюто" : "Затвори менюто");
  contentMenu?.classList.toggle("is-open", !open);
  document.body.classList.toggle("menu-open", !open);
});

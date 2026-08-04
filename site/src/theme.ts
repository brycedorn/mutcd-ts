// Inline head scripts set initial appearance before paint; this module wires
// the independent theme and sign-contrast controls.

const mq = window.matchMedia("(prefers-color-scheme: dark)");
const THEME_KEY = "theme";
const SIGN_CONTRAST_KEY = "sign-contrast";

function syncContrastButton(): void {
  const button = document.getElementById("contrast-toggle");
  if (!(button instanceof HTMLButtonElement)) return;
  button.setAttribute(
    "aria-pressed",
    String(document.documentElement.dataset.signContrast === "reduced"),
  );
}

function applySignContrast(reduced: boolean): void {
  document.documentElement.dataset.signContrast = reduced ? "reduced" : "normal";
  syncContrastButton();
}

function applyTheme(dark: boolean): void {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function initTheme(): void {
  mq.addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches);
  });

  syncContrastButton();

  const themeButton = document.getElementById("theme-toggle");
  if (themeButton instanceof HTMLButtonElement) themeButton.onclick = () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    applyTheme(dark);
    if (dark === mq.matches) localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  };

  const contrastButton = document.getElementById("contrast-toggle");
  if (contrastButton instanceof HTMLButtonElement) contrastButton.onclick = () => {
    const reduced = document.documentElement.dataset.signContrast !== "reduced";
    applySignContrast(reduced);
    localStorage.setItem(SIGN_CONTRAST_KEY, reduced ? "reduced" : "normal");
  };
}

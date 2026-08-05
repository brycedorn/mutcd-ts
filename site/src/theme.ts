// Inline head scripts set initial appearance before paint; this module wires
// the independent theme and sign-contrast controls.

const mq = window.matchMedia("(prefers-color-scheme: dark)");
const THEME_KEY = "theme";
const SIGN_CONTRAST_KEY = "sign-contrast";

function applyTheme(dark: boolean): void {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function initTheme(): void {
  mq.addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches);
  });

  const themeButton = document.getElementById("theme-toggle");
  if (themeButton instanceof HTMLButtonElement) themeButton.onclick = () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    applyTheme(dark);
    if (dark === mq.matches) localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  };

  const contrastButton = document.getElementById("contrast-toggle");
  if (!(contrastButton instanceof HTMLButtonElement)) return;
  const syncContrastButton = () => {
    contrastButton.setAttribute(
      "aria-pressed",
      String(document.documentElement.dataset.signContrast === "reduced"),
    );
  };
  syncContrastButton();
  contrastButton.onclick = () => {
    const reduced = document.documentElement.dataset.signContrast !== "reduced";
    document.documentElement.dataset.signContrast = reduced ? "reduced" : "normal";
    syncContrastButton();
    localStorage.setItem(SIGN_CONTRAST_KEY, reduced ? "reduced" : "normal");
  };
}

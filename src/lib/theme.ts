export const THEME_KEY = "muzik-survivor:theme";
export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private browsing / blocked storage — the toggle still works for
    // this page load, it just won't be remembered next visit.
  }
}

// Inlined into <head> (see layout.tsx) and run before paint, so the page
// never flashes the wrong theme on load. Keep this in sync with
// ThemeToggle's own logic.
export const themeInitScript = `
try {
  var t = localStorage.getItem("${THEME_KEY}");
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
`;

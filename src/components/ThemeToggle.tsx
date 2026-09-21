"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { applyTheme, THEME_KEY, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    (() => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_KEY);
      } catch {
        // ignore
      }
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      } else {
        setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      }
    })();
  }, []);

  if (!theme) {
    // Avoids a hydration mismatch: the real theme is only known once the
    // effect above runs (it reads localStorage), so render nothing on the
    // server/first client pass rather than guessing.
    return <span className="h-9 w-9 shrink-0" aria-hidden="true" />;
  }

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-sunk hover:text-ink"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

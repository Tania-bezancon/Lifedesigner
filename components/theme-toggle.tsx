"use client";

import { useEffect, useState } from "react";
import styles from "@/app/landing.module.css";
import { useT } from "@/lib/i18n";

type Theme = "light" | "dark";

/**
 * Reads the theme attribute set by the pre-paint script in layout.tsx,
 * lets the user toggle it, and persists the choice in localStorage.
 */
export function ThemeToggle() {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") ||
      "light") as Theme;
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ld-theme", next);
    } catch {
      /* ignore */
    }
  }

  // Render an invisible placeholder until mounted, to avoid hydration mismatches.
  if (!mounted) {
    return (
      <button
        type="button"
        className={styles.themeToggle}
        aria-hidden="true"
        tabIndex={-1}
      />
    );
  }

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggle}
      aria-label={theme === "dark" ? t("navThemeToLight") : t("navThemeToDark")}
      title={theme === "dark" ? t("navThemeToLight") : t("navThemeToDark")}
    >
      {theme === "dark" ? (
        // sun glyph
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="3.2" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <line x1="8" y1="1.5" x2="8" y2="3" />
            <line x1="8" y1="13" x2="8" y2="14.5" />
            <line x1="1.5" y1="8" x2="3" y2="8" />
            <line x1="13" y1="8" x2="14.5" y2="8" />
            <line x1="3.4" y1="3.4" x2="4.5" y2="4.5" />
            <line x1="11.5" y1="11.5" x2="12.6" y2="12.6" />
            <line x1="3.4" y1="12.6" x2="4.5" y2="11.5" />
            <line x1="11.5" y1="4.5" x2="12.6" y2="3.4" />
          </g>
        </svg>
      ) : (
        // moon glyph
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}

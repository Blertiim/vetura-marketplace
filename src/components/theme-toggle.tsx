"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vetura-theme";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  // Fillon si "null" (s'dihet ende) — pas mount-it lexojmë localStorage /
  // preferencën e sistemit, kështu shmangim mospërputhjen server/browser.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const dark =
      stored === "dark" ||
      (stored === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Kalo n'mënyrën e çelët" : "Kalo n'mënyrën e errët"}
      title={isDark ? "Mënyra e çelët" : "Mënyra e errët"}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41M12 8a4 4 0 100 8 4 4 0 000-8z"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

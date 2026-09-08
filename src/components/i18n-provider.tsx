"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

// Mbështillet rreth {children} n'root layout (server component) — merr
// locale+dict prej server-it (të lexuem prej cookie-s) dhe ua jep krejt
// client components n'pemë përmes context-it, pa pas nevojë me i kalu
// props dorë-për-dorë (prop drilling) nëpër çdo komponentë.
export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n() duhet thirrë brenda <I18nProvider>.");
  }
  return ctx;
}

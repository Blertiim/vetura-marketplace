export type Locale = "sq" | "en";

export const LOCALES: Locale[] = ["sq", "en"];
export const DEFAULT_LOCALE: Locale = "sq";
export const LOCALE_COOKIE = "vetura-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

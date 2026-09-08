import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./locale";

// Përdore vetëm n'server components/pages. Lexon cookie-n e gjuhës — nëse
// s'ekziston (vizita e parë) apo âsht e pavlefshme, kthen shqipen si default.
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

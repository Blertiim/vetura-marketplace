"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./locale";

export async function setLocaleAction(locale: Locale) {
  cookies().set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

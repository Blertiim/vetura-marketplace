import type { Locale } from "./locale";

import sqCommon from "./dictionaries/sq/common";
import sqHome from "./dictionaries/sq/home";
import sqListing from "./dictionaries/sq/listing";
import sqMessages from "./dictionaries/sq/messages";
import sqAccount from "./dictionaries/sq/account";

import enCommon from "./dictionaries/en/common";
import enHome from "./dictionaries/en/home";
import enListing from "./dictionaries/en/listing";
import enMessages from "./dictionaries/en/messages";
import enAccount from "./dictionaries/en/account";

const dictionaries = {
  sq: {
    common: sqCommon,
    home: sqHome,
    listing: sqListing,
    messages: sqMessages,
    account: sqAccount,
  },
  en: {
    common: enCommon,
    home: enHome,
    listing: enListing,
    messages: enMessages,
    account: enAccount,
  },
} as const;

// Përdore vetëm n'server components/pages: const dict = getDictionary(getLocale());
export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type Dictionary = ReturnType<typeof getDictionary>;

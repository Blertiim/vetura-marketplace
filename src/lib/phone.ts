const DIAL_CODES: Record<string, string> = {
  AL: "355",
  XK: "383",
  MK: "389",
};

/**
 * Kthen numrin e telefonit në format ndërkombëtar (vetëm shifra, pa "+"),
 * duke supozu prefiksin e shtetit të listimit nëse numri s'e ka tashmë.
 * P.sh. "044 123 456" + "XK" -> "38344123456"
 */
export function toInternationalDigits(phone: string, countryCode: string): string {
  const digitsOnly = phone.replace(/[^\d+]/g, "");

  if (digitsOnly.startsWith("+")) {
    return digitsOnly.slice(1);
  }

  const dial = DIAL_CODES[countryCode] ?? "";
  const withoutLeadingZero = digitsOnly.replace(/^0+/, "");
  return `${dial}${withoutLeadingZero}`;
}

export function whatsappLink(phone: string, countryCode: string, message: string) {
  const number = toInternationalDigits(phone, countryCode);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function viberLink(phone: string, countryCode: string) {
  const number = toInternationalDigits(phone, countryCode);
  return `viber://chat?number=%2B${number}`;
}

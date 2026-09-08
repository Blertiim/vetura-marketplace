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

/**
 * Nxjerr path-in brenda bucket-it prej një public URL t'Supabase Storage,
 * p.sh. ".../storage/v1/object/public/listing-photos/<uid>/<lid>/foto.jpg"
 * -> "<uid>/<lid>/foto.jpg"
 */
export function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

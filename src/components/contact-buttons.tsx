import { whatsappLink, viberLink } from "@/lib/phone";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function ContactButtons({
  phone,
  countryCode,
  listingTitle,
}: {
  phone: string;
  countryCode: string;
  listingTitle: string;
}) {
  const dict = getDictionary(getLocale()).listing.contact;
  const message = dict.whatsappMessage.replace("{title}", listingTitle);

  return (
    <div className="flex flex-col gap-2">
      <a
        href={whatsappLink(phone, countryCode, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 font-medium text-white hover:opacity-90"
      >
        {dict.whatsapp}
      </a>
      <a
        href={viberLink(phone, countryCode)}
        className="flex items-center justify-center gap-2 rounded-md bg-[#7360F2] px-4 py-2.5 font-medium text-white hover:opacity-90"
      >
        {dict.viber}
      </a>
      <a
        href={`tel:${phone}`}
        className="flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {dict.call}: {phone}
      </a>
    </div>
  );
}

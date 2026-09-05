import { whatsappLink, viberLink } from "@/lib/phone";

export function ContactButtons({
  phone,
  countryCode,
  listingTitle,
}: {
  phone: string;
  countryCode: string;
  listingTitle: string;
}) {
  const message = `Përshëndetje! Jam i interesuar për veturën "${listingTitle}" që e ke postu n'Vetura.`;

  return (
    <div className="flex flex-col gap-2">
      <a
        href={whatsappLink(phone, countryCode, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 font-medium text-white hover:opacity-90"
      >
        Kontakto n&apos;WhatsApp
      </a>
      <a
        href={viberLink(phone, countryCode)}
        className="flex items-center justify-center gap-2 rounded-md bg-[#7360F2] px-4 py-2.5 font-medium text-white hover:opacity-90"
      >
        Kontakto n&apos;Viber
      </a>
      <a
        href={`tel:${phone}`}
        className="flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
      >
        Telefono: {phone}
      </a>
    </div>
  );
}

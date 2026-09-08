import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const SPONSOR_EMAIL = "blertimani@gmail.com";
const SPONSOR_SUBJECT = "Sponsorizim n'Vetura";

// "mailto:" veç funksionon nëse useri ka nji app email t'caktuem si default
// n'kompjuterin e vet (p.sh. Outlook) — shumica e njerëzve s'kanë, kështu
// klikimi s'ban asgja t'dukshme. Në vend t'asaj, e hapim Gmail-in direkt
// n'browser (funksionon gjithmonë, pa varësi prej app-eve t'instaluara).
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${SPONSOR_EMAIL}&su=${encodeURIComponent(
  SPONSOR_SUBJECT
)}`;

export function SponsorSlot() {
  const dict = getDictionary(getLocale()).home.sponsor;

  return (
    <a
      href={GMAIL_COMPOSE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/60 p-6 text-center transition hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-950/80"
    >
      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-800 dark:text-brand-100">
        {dict.badge}
      </span>
      <p className="font-semibold text-slate-800 dark:text-white">{dict.heading}</p>
      <p className="text-xs text-slate-500 dark:text-slate-300">{dict.subtext}</p>
      <span className="mt-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white">
        {dict.cta}
      </span>
      <span className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{SPONSOR_EMAIL}</span>
    </a>
  );
}

import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function SponsorSlot() {
  const dict = getDictionary(getLocale()).home.sponsor;

  return (
    <a
      href="mailto:blertimani@gmail.com?subject=Sponsorizim%20n%27Vetura"
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/60 p-6 text-center transition hover:bg-brand-50 dark:border-brand-800 dark:bg-brand-950/30 dark:hover:bg-brand-950/50"
    >
      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-900 dark:text-brand-300">
        {dict.badge}
      </span>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{dict.heading}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{dict.subtext}</p>
      <span className="mt-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white">
        {dict.cta}
      </span>
    </a>
  );
}

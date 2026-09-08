"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n/locale";

export function LanguageSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  const base = "px-2 py-1.5 text-xs font-semibold transition";
  const active = "bg-brand-500 text-white";
  const inactive =
    "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <div className="flex items-center overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
      <button
        type="button"
        onClick={() => change("sq")}
        disabled={pending}
        aria-pressed={locale === "sq"}
        className={`${base} ${locale === "sq" ? active : inactive}`}
      >
        SHQ
      </button>
      <button
        type="button"
        onClick={() => change("en")}
        disabled={pending}
        aria-pressed={locale === "en"}
        className={`${base} border-l border-slate-300 dark:border-slate-700 ${
          locale === "en" ? active : inactive
        }`}
      >
        EN
      </button>
    </div>
  );
}

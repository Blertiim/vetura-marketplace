"use client";

import { useEffect, useRef } from "react";
import { logSponsorEvent } from "@/app/actions/sponsor-events";
import type { Sponsor } from "@/lib/types";

/**
 * Kartelë sponsori i vërtetë (jo statike) — t'dhanat vijnë prej tabelës
 * "sponsors" n'Supabase. Regjistron automatikisht nji "view" kur kartela
 * shfaqet n'ekran, dhe nji "click" kur klikohet butoni.
 */
export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const hasLoggedView = useRef(false);

  useEffect(() => {
    if (hasLoggedView.current) return;
    hasLoggedView.current = true;
    void logSponsorEvent(sponsor.id, "view");
  }, [sponsor.id]);

  return (
    <a
      href={sponsor.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => void logSponsorEvent(sponsor.id, "click")}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/60 p-6 text-center transition hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-950/80"
    >
      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-800 dark:text-brand-100">
        {sponsor.badge_text}
      </span>
      <p className="font-semibold text-slate-800 dark:text-white">{sponsor.heading}</p>
      {sponsor.subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-300">{sponsor.subtext}</p>
      )}
      <span className="mt-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white">
        {sponsor.cta_text}
      </span>
    </a>
  );
}

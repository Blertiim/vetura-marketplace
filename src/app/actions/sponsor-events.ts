"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Regjistron një event (shikim ose klikim) për një sponsor. Përdoret prej
 * <SponsorCard> — nji herë kur kartela shfaqet ("view") dhe nji herë kur
 * klikohet ("click"). Âsht "fire and forget": s'e ndalim asnjëherë
 * navigimin e useri-t nëse ky insert dështon.
 */
export async function logSponsorEvent(sponsorId: string, eventType: "view" | "click") {
  if (!sponsorId) return;

  try {
    const supabase = createClient();
    await supabase.from("sponsor_events").insert({ sponsor_id: sponsorId, event_type: eventType });
  } catch {
    // Statistikat s'janë kritike — nëse dështon, s'duhet me e prishë
    // eksperiencën e useri-t.
  }
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewListingForm } from "@/components/new-listing-form";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { City, Country } from "@/lib/types";

export default async function NewListingPage() {
  const supabase = createClient();
  const dict = getDictionary(getLocale()).listing;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hyr");
  }

  const [{ data: countries }, { data: cities }] = await Promise.all([
    supabase.from("countries").select("*").order("name"),
    supabase.from("cities").select("*").order("name"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">
        {dict.postoVeturenTende}
      </h1>
      <NewListingForm
        countries={(countries as Country[]) ?? []}
        cities={(cities as City[]) ?? []}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewListingForm } from "@/components/new-listing-form";
import type { City, Country } from "@/lib/types";

export default async function NewListingPage() {
  const supabase = createClient();
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
      <h1 className="mb-6 text-xl font-semibold text-slate-900">
        Posto veturën tënde
      </h1>
      <NewListingForm
        countries={(countries as Country[]) ?? []}
        cities={(cities as City[]) ?? []}
      />
    </div>
  );
}

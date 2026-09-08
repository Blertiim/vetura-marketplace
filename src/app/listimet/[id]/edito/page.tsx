import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditListingForm } from "@/components/edit-listing-form";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { City, Country, Listing, ListingAvailability, ListingPhoto } from "@/lib/types";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const dict = getDictionary(getLocale()).listing;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hyr");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!listing) {
    notFound();
  }

  const typedListing = listing as Listing;

  if (typedListing.owner_id !== user.id) {
    redirect(`/listimet/${typedListing.id}`);
  }

  const [{ data: countries }, { data: cities }, { data: photos }, { data: availability }] =
    await Promise.all([
      supabase.from("countries").select("*").order("name"),
      supabase.from("cities").select("*").order("name"),
      supabase
        .from("listing_photos")
        .select("*")
        .eq("listing_id", typedListing.id)
        .order("sort_order"),
      supabase
        .from("listing_availability")
        .select("*")
        .eq("listing_id", typedListing.id)
        .order("start_date"),
    ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">
        {dict.editoListimin}
      </h1>
      <EditListingForm
        listing={typedListing}
        countries={(countries as Country[]) ?? []}
        cities={(cities as City[]) ?? []}
        initialPhotos={(photos as ListingPhoto[]) ?? []}
        initialAvailability={(availability as ListingAvailability[]) ?? []}
      />
    </div>
  );
}

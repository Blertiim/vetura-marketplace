import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { ContactButtons } from "@/components/contact-buttons";
import { format } from "date-fns";
import type {
  City,
  Country,
  Listing,
  ListingAvailability,
  ListingPhoto,
  Profile,
} from "@/lib/types";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!listing) {
    notFound();
  }

  const typedListing = listing as Listing;

  const [{ data: city }, { data: photos }, { data: availability }, { data: owner }] =
    await Promise.all([
      supabase.from("cities").select("*, countries(*)").eq("id", typedListing.city_id).single(),
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
      supabase.from("profiles").select("*").eq("id", typedListing.owner_id).single(),
    ]);

  const cityData = city as (City & { countries: Country }) | null;
  const ownerData = owner as Profile | null;
  const unitLabel = typedListing.price_unit === "day" ? "/ditë" : "/javë";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PhotoGallery
          photos={(photos as ListingPhoto[]) ?? []}
          title={typedListing.title}
        />

        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          {typedListing.title}
        </h1>
        <p className="text-slate-500">
          {cityData?.name}
          {cityData?.countries ? `, ${cityData.countries.name}` : ""}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
          {typedListing.mileage_km != null && (
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {typedListing.mileage_km.toLocaleString()} km
            </span>
          )}
          {typedListing.condition && (
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Gjendja: {typedListing.condition}
            </span>
          )}
        </div>

        {typedListing.description && (
          <p className="mt-4 whitespace-pre-line text-slate-700">
            {typedListing.description}
          </p>
        )}

        {availability && availability.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 font-medium text-slate-900">Kur âsht e lirë</h2>
            <ul className="flex flex-wrap gap-2 text-sm">
              {(availability as ListingAvailability[]).map((period) => (
                <li
                  key={period.id}
                  className="rounded-md border border-slate-200 px-3 py-1.5"
                >
                  {format(new Date(period.start_date), "d MMM yyyy")} –{" "}
                  {format(new Date(period.end_date), "d MMM yyyy")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold text-brand-700">
            {typedListing.price_amount}€{" "}
            <span className="text-sm font-normal text-slate-500">{unitLabel}</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Postuar nga {ownerData?.full_name || "Përdorues"}
          </p>

          <div className="mt-4">
            {ownerData?.phone ? (
              <ContactButtons
                phone={ownerData.phone}
                countryCode={cityData?.countries?.code ?? "XK"}
                listingTitle={typedListing.title}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Pronari s&apos;ka lanë numër telefoni akoma.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

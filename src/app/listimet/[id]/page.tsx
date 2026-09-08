import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { ContactButtons } from "@/components/contact-buttons";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
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
  const dict = getDictionary(getLocale()).listing.detail;

  // "Kush âsht loguar" s'varet prej listimit, prandaj e marrim n'paralel
  // me listimin vetë — jo pas tij.
  const [{ data: listing }, {
    data: { user },
  }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", params.id).single(),
    supabase.auth.getUser(),
  ]);

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
  const unitLabel = typedListing.price_unit === "day" ? dict.perDite : dict.perJave;

  const isOwner = user?.id === typedListing.owner_id;

  async function startConversation() {
    "use server";
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/hyr");
    }

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", typedListing.id)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (existing) {
      redirect(`/mesazhet/${existing.id}`);
    }

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: typedListing.id,
        buyer_id: user.id,
        seller_id: typedListing.owner_id,
      })
      .select("id")
      .single();

    if (error || !created) {
      redirect(`/listimet/${typedListing.id}`);
    }

    redirect(`/mesazhet/${created.id}`);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PhotoGallery
          photos={(photos as ListingPhoto[]) ?? []}
          title={typedListing.title}
        />

        <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {typedListing.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {cityData?.name}
          {cityData?.countries ? `, ${cityData.countries.name}` : ""}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
          {typedListing.body_type && (
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              {typedListing.body_type}
            </span>
          )}
          {typedListing.mileage_km != null && (
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              {typedListing.mileage_km.toLocaleString()} km
            </span>
          )}
          {typedListing.transmission && (
            <span className="rounded-full bg-slate-100 px-3 py-1 capitalize dark:bg-slate-800">
              {typedListing.transmission}
            </span>
          )}
          {typedListing.fuel_type && (
            <span className="rounded-full bg-slate-100 px-3 py-1 capitalize dark:bg-slate-800">
              {typedListing.fuel_type}
            </span>
          )}
          {typedListing.color && (
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              {typedListing.color}
            </span>
          )}
          {typedListing.condition && (
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              {dict.gjendja}: {typedListing.condition}
            </span>
          )}
        </div>

        {typedListing.description && (
          <p className="mt-4 whitespace-pre-line text-slate-700 dark:text-slate-300">
            {typedListing.description}
          </p>
        )}

        {availability && availability.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 font-medium text-slate-900 dark:text-slate-100">{dict.kurEshteELire}</h2>
            <ul className="flex flex-wrap gap-2 text-sm">
              {(availability as ListingAvailability[]).map((period) => (
                <li
                  key={period.id}
                  className="rounded-md border border-slate-200 px-3 py-1.5 dark:border-slate-700"
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-semibold text-brand-700 dark:text-brand-500">
            {typedListing.price_amount}€{" "}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{unitLabel}</span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {dict.postuarNga} {ownerData?.full_name || dict.perdorues}
          </p>

          <div className="mt-4">
            {isOwner ? (
              <Link
                href={`/listimet/${typedListing.id}/edito`}
                className="block rounded-md border border-slate-300 px-4 py-2.5 text-center font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {dict.listimiYt}
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <form action={startConversation}>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    {dict.dergoMesazh}
                  </button>
                </form>

                {ownerData?.phone ? (
                  <ContactButtons
                    phone={ownerData.phone}
                    countryCode={cityData?.countries?.code ?? "XK"}
                    listingTitle={typedListing.title}
                  />
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{dict.paNumerTelefoni}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

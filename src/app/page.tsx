import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingFilters } from "@/components/listing-filters";
import { ListingCard } from "@/components/listing-card";
import { SponsorSlot } from "@/components/sponsor-slot";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { City, Country, ListingSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: {
    shteti?: string;
    qyteti?: string;
    cmimiMin?: string;
    cmimiMax?: string;
    vitiMin?: string;
    vitiMax?: string;
    kmMax?: string;
    transmisioni?: string;
    karburanti?: string;
    ngjyra?: string;
    karoceria?: string;
    q?: string;
  };
}) {
  if (!isSupabaseConfigured) {
    return <SetupNeeded />;
  }

  const dict = getDictionary(getLocale()).home;
  const supabase = createClient();

  const [{ data: countries }, { data: cities }] = await Promise.all([
    supabase.from("countries").select("*").order("name"),
    supabase.from("cities").select("*").order("name"),
  ]);

  // Vetëm kolonat qi i duhen kartelës n'ballinë — jo krejt tabela ("*"),
  // kështu payload-i âsht ma i vogël dhe faqja ngarkohet ma shpejt.
  let query = supabase
    .from("listings")
    .select(
      "id, owner_id, title, brand, model, year, price_amount, price_unit, city_id, status, created_at"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (searchParams.qyteti) {
    query = query.eq("city_id", Number(searchParams.qyteti));
  } else if (searchParams.shteti) {
    const cityIdsInCountry = (cities ?? [])
      .filter((c: City) => String(c.country_id) === searchParams.shteti)
      .map((c: City) => c.id);
    query = query.in("city_id", cityIdsInCountry.length ? cityIdsInCountry : [-1]);
  }

  if (searchParams.cmimiMin) {
    query = query.gte("price_amount", Number(searchParams.cmimiMin));
  }
  if (searchParams.cmimiMax) {
    query = query.lte("price_amount", Number(searchParams.cmimiMax));
  }
  if (searchParams.vitiMin) {
    query = query.gte("year", Number(searchParams.vitiMin));
  }
  if (searchParams.vitiMax) {
    query = query.lte("year", Number(searchParams.vitiMax));
  }
  if (searchParams.kmMax) {
    query = query.lte("mileage_km", Number(searchParams.kmMax));
  }
  if (searchParams.transmisioni) {
    query = query.eq("transmission", searchParams.transmisioni);
  }
  if (searchParams.karburanti) {
    query = query.eq("fuel_type", searchParams.karburanti);
  }
  if (searchParams.ngjyra) {
    query = query.eq("color", searchParams.ngjyra);
  }
  if (searchParams.karoceria) {
    query = query.eq("body_type", searchParams.karoceria);
  }
  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,brand.ilike.%${searchParams.q}%,model.ilike.%${searchParams.q}%`
    );
  }

  const { data: listings } = await query;

  const listingIds = (listings ?? []).map((l: ListingSummary) => l.id);
  const ownerIds = Array.from(new Set((listings ?? []).map((l: ListingSummary) => l.owner_id)));

  // Fotot dhe pronarët s'varen njani prej tjetrit — i marrim n'paralel
  // (Promise.all) n'vend se njani pas tjetrit, kështu faqja pret vetëm
  // për ma t'ngadaltën prej dyjave, jo për shumën e kohës s'dyjave.
  const [{ data: photos }, { data: owners }] = await Promise.all([
    listingIds.length
      ? supabase
          .from("listing_photos")
          .select("listing_id, url, sort_order")
          .in("listing_id", listingIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as { listing_id: string; url: string }[] }),
    ownerIds.length
      ? supabase.from("profiles").select("id, full_name, avatar_url").in("id", ownerIds)
      : Promise.resolve({
          data: [] as { id: string; full_name: string | null; avatar_url: string | null }[],
        }),
  ]);

  const coverByListing = new Map<string, string>();
  for (const photo of photos ?? []) {
    if (!coverByListing.has(photo.listing_id)) {
      coverByListing.set(photo.listing_id, photo.url);
    }
  }
  const cityById = new Map((cities ?? []).map((c: City) => [c.id, c.name]));

  const ownerById = new Map(
    (owners ?? []).map((o: { id: string; full_name: string | null; avatar_url: string | null }) => [o.id, o])
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {dict.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{dict.subtitle}</p>
      </div>

      <ListingFilters countries={(countries as Country[]) ?? []} cities={(cities as City[]) ?? []} />

      {(!listings || listings.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {dict.emptyState}{" "}
          <a href="/listimet/e-reja" className="text-brand-600 underline dark:text-brand-500">
            {dict.emptyStateLink}
          </a>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(() => {
            const owner = (l: ListingSummary) => ownerById.get(l.owner_id);
            const cards = listings.map((listing: ListingSummary) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                cityName={cityById.get(listing.city_id) ?? ""}
                coverPhotoUrl={coverByListing.get(listing.id) ?? null}
                ownerName={owner(listing)?.full_name ?? dict.card.perdorues}
                ownerAvatarUrl={owner(listing)?.avatar_url ?? null}
              />
            ));
            // Fut hapësirën e sponsorit si "kartelë" brenda grid-it — pas
            // 2 listimeve t'para (ose n'fund, nëse ka ma pak se 2).
            cards.splice(Math.min(2, cards.length), 0, <SponsorSlot key="sponsor" />);
            return cards;
          })()}
        </div>
      )}
    </div>
  );
}

function SetupNeeded() {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      <h2 className="mb-2 text-lg font-semibold">Supabase s&apos;âsht konfiguru akoma</h2>
      <p className="text-sm">
        Krijo një file <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> n&apos;rrënjë
        të projektit (kopjo prej <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local.example</code>)
        dhe plotëso <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_SUPABASE_URL</code> dhe{" "}
        <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> prej
        Dashboard-it t&apos;Supabase-it (Project Settings → API). Shiko README.md për hapat e plotë.
      </p>
    </div>
  );
}

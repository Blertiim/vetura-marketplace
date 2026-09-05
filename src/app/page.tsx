import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingFilters } from "@/components/listing-filters";
import { ListingCard } from "@/components/listing-card";
import type { City, Country, Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { shteti?: string; qyteti?: string; cmimiMax?: string };
}) {
  if (!isSupabaseConfigured) {
    return <SetupNeeded />;
  }

  const supabase = createClient();

  const [{ data: countries }, { data: cities }] = await Promise.all([
    supabase.from("countries").select("*").order("name"),
    supabase.from("cities").select("*").order("name"),
  ]);

  let query = supabase
    .from("listings")
    .select("*")
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

  if (searchParams.cmimiMax) {
    query = query.lte("price_amount", Number(searchParams.cmimiMax));
  }

  const { data: listings } = await query;

  const listingIds = (listings ?? []).map((l: Listing) => l.id);
  const { data: photos } = listingIds.length
    ? await supabase
        .from("listing_photos")
        .select("*")
        .in("listing_id", listingIds)
        .order("sort_order", { ascending: true })
    : { data: [] as { listing_id: string; url: string }[] };

  const coverByListing = new Map<string, string>();
  for (const photo of photos ?? []) {
    if (!coverByListing.has(photo.listing_id)) {
      coverByListing.set(photo.listing_id, photo.url);
    }
  }
  const cityById = new Map((cities ?? []).map((c: City) => [c.id, c.name]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Gjej një veturë për verë
        </h1>
        <p className="text-slate-500">
          Vetura personale, direkt nga pronarët — Shqipëri, Kosovë, Maqedoni.
        </p>
      </div>

      <ListingFilters countries={(countries as Country[]) ?? []} cities={(cities as City[]) ?? []} />

      {(!listings || listings.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Ende s&apos;ka listime që përputhen me filtrin. Provo me e ndryshu filtrin,
          ose{" "}
          <a href="/listimet/e-reja" className="text-brand-600 underline">
            posto veturën tënde t&apos;parën
          </a>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: Listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              cityName={cityById.get(listing.city_id) ?? ""}
              coverPhotoUrl={coverByListing.get(listing.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SetupNeeded() {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
      <h2 className="mb-2 text-lg font-semibold">Supabase s&apos;âsht konfiguru akoma</h2>
      <p className="text-sm">
        Krijo një file <code className="rounded bg-amber-100 px-1">.env.local</code> n&apos;rrënjë
        të projektit (kopjo prej <code className="rounded bg-amber-100 px-1">.env.local.example</code>)
        dhe plotëso <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> dhe{" "}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> prej
        Dashboard-it t&apos;Supabase-it (Project Settings → API). Shiko README.md për hapat e plotë.
      </p>
    </div>
  );
}

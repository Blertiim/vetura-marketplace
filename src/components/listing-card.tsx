import Link from "next/link";
import type { Listing } from "@/lib/types";

export function ListingCard({
  listing,
  cityName,
  coverPhotoUrl,
}: {
  listing: Listing;
  cityName: string;
  coverPhotoUrl: string | null;
}) {
  const unitLabel = listing.price_unit === "day" ? "/ditë" : "/javë";

  return (
    <Link
      href={`/listimet/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full bg-slate-100">
        {coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverPhotoUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Pa foto
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-medium text-slate-900">{listing.title}</h3>
        <p className="text-sm text-slate-500">
          {listing.brand} {listing.model} · {listing.year}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-slate-500">{cityName}</span>
          <span className="font-semibold text-brand-700">
            {listing.price_amount}€ <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

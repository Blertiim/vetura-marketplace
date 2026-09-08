import Link from "next/link";
import Image from "next/image";
import type { ListingSummary } from "@/lib/types";
import { OwnerAvatar } from "@/components/owner-avatar";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function ListingCard({
  listing,
  cityName,
  coverPhotoUrl,
  ownerName,
  ownerAvatarUrl,
}: {
  listing: ListingSummary;
  cityName: string;
  coverPhotoUrl: string | null;
  ownerName?: string;
  ownerAvatarUrl?: string | null;
}) {
  const dict = getDictionary(getLocale()).home.card;
  const unitLabel = listing.price_unit === "day" ? dict.perDite : dict.perJave;

  return (
    <Link
      href={`/listimet/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
        {coverPhotoUrl ? (
          <Image
            src={coverPhotoUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            {dict.paFoto}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-medium text-slate-900 dark:text-slate-100">{listing.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {listing.brand} {listing.model} · {listing.year}
        </p>

        {ownerName && (
          <div className="mt-2 flex items-center gap-1.5">
            <OwnerAvatar name={ownerName} avatarUrl={ownerAvatarUrl ?? null} size={18} />
            <span className="truncate text-xs text-slate-500 dark:text-slate-400">{ownerName}</span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">{cityName}</span>
          <span className="font-semibold text-brand-700 dark:text-brand-500">
            {listing.price_amount}€{" "}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{unitLabel}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

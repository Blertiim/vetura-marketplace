import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Listing, ListingPhoto } from "@/lib/types";

export default async function MyListingsPage() {
  const supabase = createClient();
  const dict = getDictionary(getLocale()).listing.myListings;

  const STATUS_LABEL: Record<string, string> = {
    active: dict.aktiv,
    paused: dict.pauzuar,
    deleted: dict.fshire,
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hyr");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  const listingIds = (listings ?? []).map((l: Listing) => l.id);
  const { data: photos } = listingIds.length
    ? await supabase
        .from("listing_photos")
        .select("*")
        .in("listing_id", listingIds)
        .order("sort_order", { ascending: true })
    : { data: [] as ListingPhoto[] };

  const coverByListing = new Map<string, string>();
  for (const photo of (photos as ListingPhoto[]) ?? []) {
    if (!coverByListing.has(photo.listing_id)) {
      coverByListing.set(photo.listing_id, photo.url);
    }
  }

  async function toggleStatus(formData: FormData) {
    "use server";
    const supabase = createClient();
    const listingId = String(formData.get("listingId"));
    const nextStatus = String(formData.get("nextStatus"));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/hyr");

    await supabase
      .from("listings")
      .update({ status: nextStatus })
      .eq("id", listingId)
      .eq("owner_id", user.id);

    revalidatePath("/listimet/e-mia");
  }

  async function deleteListing(formData: FormData) {
    "use server";
    const supabase = createClient();
    const listingId = String(formData.get("listingId"));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/hyr");

    // Soft delete — e mbajmë rreshtin (histori), thjesht s'shfaqet m'kund.
    await supabase
      .from("listings")
      .update({ status: "deleted" })
      .eq("id", listingId)
      .eq("owner_id", user.id);

    revalidatePath("/listimet/e-mia");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{dict.listimetEMia}</h1>
        <Link
          href="/listimet/e-reja"
          className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          + {dict.postoVetureTre}
        </Link>
      </div>

      {(!listings || listings.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {dict.skePostuAsnje}{" "}
          <Link href="/listimet/e-reja" className="text-brand-600 underline dark:text-brand-500">
            {dict.postoTeParenKetu}
          </Link>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(listings as Listing[]).map((listing) => {
            const cover = coverByListing.get(listing.id);
            const nextStatus = listing.status === "active" ? "paused" : "active";
            const toggleLabel = listing.status === "active" ? dict.pauzo : dict.aktivizo;
            const unitLabel = listing.price_unit === "day" ? dict.dite : dict.jave;

            return (
              <div
                key={listing.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-slate-400 dark:text-slate-500">
                      {dict.paFoto}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">{listing.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {listing.price_amount}€/{unitLabel} ·{" "}
                    <span
                      className={
                        listing.status === "active"
                          ? "text-green-600 dark:text-green-400"
                          : "text-amber-600 dark:text-amber-400"
                      }
                    >
                      {STATUS_LABEL[listing.status]}
                    </span>
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <Link
                    href={`/listimet/${listing.id}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {dict.shiko}
                  </Link>
                  <Link
                    href={`/listimet/${listing.id}/edito`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {dict.edito}
                  </Link>
                  <form action={toggleStatus}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <input type="hidden" name="nextStatus" value={nextStatus} />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {toggleLabel}
                    </button>
                  </form>
                  <form action={deleteListing}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <ConfirmSubmitButton
                      confirmMessage={dict.konfirmoFshirjen}
                      className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      {dict.fshi}
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

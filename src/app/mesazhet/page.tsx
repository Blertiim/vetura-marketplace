import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listings: { title: string } | null;
  buyer: { full_name: string | null } | null;
  seller: { full_name: string | null } | null;
};

export default async function ConversationsListPage() {
  const supabase = createClient();
  const dict = getDictionary(getLocale()).messages.list;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hyr");
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      "*, listings(title), buyer:profiles!conversations_buyer_id_fkey(full_name), seller:profiles!conversations_seller_id_fkey(full_name)"
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">{dict.title}</h1>

      {(!conversations || conversations.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {dict.empty}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {(conversations as unknown as ConversationRow[]).map((c) => {
            const isBuyer = c.buyer_id === user.id;
            const otherPartyName = isBuyer
              ? c.seller?.full_name ?? dict.perdorues
              : c.buyer?.full_name ?? dict.perdorues;

            return (
              <Link
                key={c.id}
                href={`/mesazhet/${c.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">{otherPartyName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {dict.rreth}: {c.listings?.title ?? dict.listimIFshire}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

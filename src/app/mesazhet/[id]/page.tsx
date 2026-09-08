import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/chat-thread";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const dict = getDictionary(getLocale()).messages.thread;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hyr");
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      "*, listings(id, title), buyer:profiles!conversations_buyer_id_fkey(full_name), seller:profiles!conversations_seller_id_fkey(full_name)"
    )
    .eq("id", params.id)
    .single();

  if (!conversation) {
    notFound();
  }

  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
    redirect("/mesazhet");
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true });

  const isBuyer = conversation.buyer_id === user.id;
  const otherPartyName = isBuyer
    ? conversation.seller?.full_name ?? dict.perdorues
    : conversation.buyer?.full_name ?? dict.perdorues;

  return (
    <div>
      <div className="mb-4">
        <Link href="/mesazhet" className="text-sm text-brand-600 hover:underline">
          {dict.krejtMesazhet}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {dict.bisedaMe.replace("{name}", otherPartyName)}
        </h1>
        {conversation.listings && (
          <Link
            href={`/listimet/${conversation.listings.id}`}
            className="text-sm text-slate-500 hover:underline dark:text-slate-400"
          >
            {dict.rreth}: {conversation.listings.title}
          </Link>
        )}
      </div>

      <ChatThread
        conversationId={params.id}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/i18n-provider";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
};

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.messages.thread;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Shëno si "u lexue" krejt mesazhet e palexuara qi s'i kena dërgu vetë.
  useEffect(() => {
    const unreadIds = messages
      .filter((m) => m.sender_id !== currentUserId && !m.read_at)
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            unreadIds.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m
          )
        );
        // Rifresko layout-in n'server (badge-i n'header) — badge-i vet
        // gjithashtu ndreqet vetë n'kohë reale, kjo osht thjesht siguri shtesë.
        router.refresh();
      });
  }, [messages, currentUserId, supabase, router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setSending(true);
    const text = body;
    setBody("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        body: text,
      })
      .select()
      .single();

    setSending(false);

    if (!error && data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]
      );
    }
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500">
            {t.paMesazhe}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => {
              const isMine = m.sender_id === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    isMine
                      ? "ml-auto bg-brand-500 text-white"
                      : "mr-auto bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  <p>{m.body}</p>
                  {isMine && (
                    <p className="mt-0.5 text-right text-[10px] text-white/70">
                      {m.read_at ? t.uLexua : t.derguar}
                    </p>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {t.dergo}
        </button>
      </form>
    </div>
  );
}

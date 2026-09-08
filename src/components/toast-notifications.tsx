"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/i18n-provider";

type Toast = {
  id: string;
  conversationId: string;
  senderName: string;
  preview: string;
};

const AUTO_DISMISS_MS = 6000;
const PREVIEW_MAX = 46;

export function ToastNotifications({ userId }: { userId: string | null }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const { dict } = useI18n();
  const tr = dict.messages.toast;

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Njofton me nji "toast" t'vogël (poshtë djathtas) kur na vjen mesazh i ri
  // — pa pas nevojë me kqyr faqen "Mesazhet" për me e ditë kush po shkruen.
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`toast-messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            body: string;
          };

          // Mesazhet qi i dërgojmë vet nuk kanë pse me na njoftu neve.
          if (msg.sender_id === userId) return;

          // Nëse jena tashmë tuj shiku pikërisht atë bisedë, s'ka nevojë
          // për toast — mesazhi ashtu duket direkt n'ekran.
          if (pathnameRef.current === `/mesazhet/${msg.conversation_id}`) return;

          const { data: sender } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", msg.sender_id)
            .single();

          const senderName = sender?.full_name?.trim() || tr.dikush;
          const preview =
            msg.body.length > PREVIEW_MAX
              ? `${msg.body.slice(0, PREVIEW_MAX).trimEnd()}…`
              : msg.body;

          const toastId = `${msg.id}-${Date.now()}`;
          setToasts((prev) => [...prev, { id: toastId, conversationId: msg.conversation_id, senderName, preview }]);

          setTimeout(() => dismiss(toastId), AUTO_DISMISS_MS);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            dismiss(t.id);
            router.push(`/mesazhet/${t.conversationId}`);
          }}
          className="animate-toast-in pointer-events-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm shadow-lg transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true" className="text-brand-500">
            💬
          </span>
          <span className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{t.senderName}</span>
            <span className="text-slate-500 dark:text-slate-400"> — {t.preview}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

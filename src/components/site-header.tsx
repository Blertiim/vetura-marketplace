"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { OwnerAvatar } from "@/components/owner-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";
import { createClient } from "@/lib/supabase/client";

// E ndame me 2 hapa (jo embed+or n'nji query t'vetme) qëllimisht — âsht
// ma pak "ekzotike" për PostgREST/RLS, prandaj ma e sigurt me punu njësoj
// nga browser-i sa herë qi thirret (p.sh. brenda callback-ut t'realtime-it).
async function fetchUnreadCount(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: convos, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (convError) {
    console.error("[badge] gabim gjatë leximit t'bisedave:", convError);
    return null;
  }
  if (!convos || convos.length === 0) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in(
      "conversation_id",
      convos.map((c) => c.id)
    )
    .is("read_at", null)
    .neq("sender_id", userId);

  if (error) {
    console.error("[badge] gabim gjatë numrimit t'mesazheve t'palexuara:", error);
    return null;
  }
  return count ?? 0;
}

export function SiteHeader({
  userLabel,
  logoutAction,
  userId = null,
  unreadCount: initialUnreadCount = 0,
  userAvatarUrl = null,
}: {
  userLabel: string | null;
  logoutAction: () => void;
  userId?: string | null;
  unreadCount?: number;
  userAvatarUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const pathname = usePathname();
  const { dict } = useI18n();
  const t = dict.common;

  // Mbaje badge-in e mesazheve t'palexuara t'freskët n'kohë reale — pa
  // pas nevojë me ricarku faqen. Supabase Realtime na njofton vetëm për
  // rreshtat qi RLS na lejon me i pa (dmth vetëm bisedat tona).
  //
  // Përveç realtime-it, mban edhe nji "poll" çdo 10 sekonda si rrjetë
  // sigurie — nëse për ndonji arsye (firewall, ad-blocker, websocket i
  // ndërprem, etj.) push-i i realtime-it s'arrin, badge-i prapë vetëm-
  // ndreqet vetë brenda pak sekondash pa pas nevojë userin me ricarku.
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    let cancelled = false;

    const refresh = () => {
      fetchUnreadCount(supabase, userId).then((n) => {
        if (!cancelled && n !== null) setUnreadCount(n);
      });
    };

    refresh();

    const channel = supabase
      .channel(`unread-badge-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        refresh
      )
      .subscribe();

    const pollId = setInterval(refresh, 10_000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const isLoggedIn = userLabel !== null;

  const links: { href: string; label: string; badge?: number }[] = isLoggedIn
    ? [
        { href: "/listimet/e-reja", label: t.nav.postoVeturen },
        { href: "/listimet/e-mia", label: t.nav.listimetEMia },
        { href: "/mesazhet", label: t.nav.mesazhet, badge: unreadCount },
      ]
    : [{ href: "/listimet/e-reja", label: t.nav.postoVeturen }];

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-brand-700 dark:text-brand-500">
          <Logo className="h-7 w-7 text-brand-500" />
          {t.siteTitle}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative ${
                pathname === link.href
                  ? "font-medium text-brand-600 dark:text-brand-500"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              {link.label}
              {!!link.badge && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium leading-none text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              <Link
                href="/llogaria"
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <OwnerAvatar name={userLabel ?? "?"} avatarUrl={userAvatarUrl} size={22} />
                <span className="max-w-[10rem] truncate">{userLabel}</span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t.nav.dil}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/hyr" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                {t.nav.hyr}
              </Link>
              <Link
                href="/regjistrohu"
                className="rounded-md bg-brand-500 px-3 py-1.5 font-medium text-white hover:bg-brand-600"
              >
                {t.nav.regjistrohu}
              </Link>
            </>
          )}

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 dark:border-slate-800">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.nav.hapMenyne}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden="true">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-md px-2 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {link.label}
              {!!link.badge && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-medium leading-none text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              <Link
                href="/llogaria"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <OwnerAvatar name={userLabel ?? "?"} avatarUrl={userAvatarUrl} size={22} />
                <span className="truncate">{userLabel}</span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-md px-2 py-2 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t.nav.dil}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/hyr"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t.nav.hyr}
              </Link>
              <Link
                href="/regjistrohu"
                onClick={() => setOpen(false)}
                className="rounded-md bg-brand-500 px-2 py-2 font-medium text-white hover:bg-brand-600"
              >
                {t.nav.regjistrohu}
              </Link>
            </>
          )}

          <div className="mt-1 flex items-center justify-center border-t border-slate-200 pt-3 dark:border-slate-800">
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}

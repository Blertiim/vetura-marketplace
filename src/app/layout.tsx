import type { Metadata } from "next";
import "./globals.css";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { ToastNotifications } from "@/components/toast-notifications";
import { I18nProvider } from "@/components/i18n-provider";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(getLocale());
  return {
    title: dict.common.metaTitle,
    description: dict.common.metaDescription,
  };
}

// Script i vogël qi xhirohet PARA se React me u hidratu — lexon preferencën
// e temës (localStorage, ose t'sistemit nëse s'ka pas encara zgjedhë) dhe i
// vendos class "dark" n'<html> menjiherë, kështu shmangim "flash"-in e
// temës s'gabuar kur ngarkohet faqja.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('vetura-theme');
    var dark = stored === 'dark' || (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const locale = getLocale();
  const dict = getDictionary(locale);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function logout() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  let userLabel: string | null = null;
  let unreadCount = 0;
  let userAvatarUrl: string | null = null;
  if (user) {
    // Ky layout xhirohet n'çdo faqe t'sajtit, prandaj i marrim të dyja
    // pyetjet n'paralel (Promise.all) — jo njëra pas tjetrës — që çdo
    // navigim n'sajt me u ndje ma i shpejtë.
    const [{ data: profile }, { count }] = await Promise.all([
      // Emri qi shifet n'header duhet me ardhë prej tabelës "profiles" (aty
      // ruhet kur useri e ndryshon prej faqes "Llogaria ime"), jo prej
      // user_metadata t'auth-it — ai âsht vetëm emri i dhanë n'regjistrim
      // dhe s'ndryshon ma vet.
      supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
      supabase
        .from("messages")
        .select("id, conversations!inner(buyer_id, seller_id)", {
          count: "exact",
          head: true,
        })
        .is("read_at", null)
        .neq("sender_id", user.id)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`, {
          foreignTable: "conversations",
        }),
    ]);
    userLabel = profile?.full_name || user.user_metadata?.full_name || user.email || "Llogaria ime";
    userAvatarUrl = profile?.avatar_url ?? null;
    unreadCount = count ?? 0;
  }

  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <I18nProvider locale={locale} dict={dict}>
          <SiteHeader
            userLabel={userLabel}
            logoutAction={logout}
            userId={user?.id ?? null}
            unreadCount={unreadCount}
            userAvatarUrl={userAvatarUrl}
          />
          <main className="mx-auto min-h-screen max-w-6xl px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {dict.common.footer}
          </footer>
          <ToastNotifications userId={user?.id ?? null} />
        </I18nProvider>
      </body>
    </html>
  );
}

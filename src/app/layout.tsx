import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Vetura | Marketplace i veturave për verë",
  description:
    "Posto veturën tënde ose gjej një veturë për verë — Shqipëri, Kosovë, Maqedoni.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function logout() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <html lang="sq">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-brand-700">
              Vetura
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/listimet/e-reja" className="text-brand-600 hover:underline">
                Posto veturën
              </Link>

              {user ? (
                <>
                  <span className="text-slate-600">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Dil
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/hyr" className="text-slate-600 hover:text-slate-900">
                    Hyr
                  </Link>
                  <Link
                    href="/regjistrohu"
                    className="rounded-md bg-brand-500 px-3 py-1.5 font-medium text-white hover:bg-brand-600"
                  >
                    Regjistrohu
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          Vetura — marketplace komuniteti, jo agjenci qeraje.
        </footer>
      </body>
    </html>
  );
}

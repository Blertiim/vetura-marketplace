import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/hyr?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Hyr n&apos;llogari</h1>

      {searchParams.error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={login} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="Fjalëkalimi"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Hyr
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        S&apos;ke llogari?{" "}
        <a href="/regjistrohu" className="text-brand-600 underline">
          Regjistrohu këtu
        </a>
        .
      </p>
    </div>
  );
}

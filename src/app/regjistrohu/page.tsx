import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  async function register(formData: FormData) {
    "use server";
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const fullName = String(formData.get("fullName"));
    const phone = String(formData.get("phone"));
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (error) {
      redirect(`/regjistrohu?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/regjistrohu?success=1");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Krijo llogari</h1>

      {searchParams.error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}
      {searchParams.success && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          U regjistrove! Kontrollo email-in tand për me e konfirmu llogarinë, mandej
          hyr n&apos;llogari.
        </p>
      )}

      <form action={register} className="flex flex-col gap-3">
        <input
          type="text"
          name="fullName"
          required
          placeholder="Emri e Mbiemri"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="tel"
          name="phone"
          required
          placeholder="Numri i telefonit (p.sh. 04X XXX XXX)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
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
          minLength={6}
          placeholder="Fjalëkalimi (min. 6 shkronja)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Regjistrohu
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Ke tashmë llogari?{" "}
        <a href="/hyr" className="text-brand-600 underline">
          Hyr këtu
        </a>
        .
      </p>
    </div>
  );
}

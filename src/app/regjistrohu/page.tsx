import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  // Nëse useri âsht tashmë i loguem, s'ka pse me i shfaq formën e regjistrimit
  // (ishte bug: header-i tregonte "Dil"/badge, kurse poshtë dilte forma).
  const supabaseCheck = createClient();
  const {
    data: { user },
  } = await supabaseCheck.auth.getUser();
  if (user && !searchParams.success) {
    redirect("/");
  }

  const dict = getDictionary(getLocale()).account.register;

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
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">{dict.title}</h1>

      {searchParams.error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {searchParams.error}
        </p>
      )}
      {searchParams.success && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          {dict.uRegjistrove}
        </p>
      )}

      <form action={register} className="flex flex-col gap-3">
        <input
          type="text"
          name="fullName"
          required
          placeholder={dict.emriMbiemri}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <input
          type="tel"
          name="phone"
          required
          placeholder={dict.numriTelefonit}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder={dict.fjalekalimi}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          {dict.submit}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {dict.keLlogari}{" "}
        <a href="/hyr" className="text-brand-600 underline dark:text-brand-500">
          {dict.hyrKetu}
        </a>
        .
      </p>
    </div>
  );
}

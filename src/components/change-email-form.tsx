"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/i18n-provider";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const supabase = createClient();
  const { dict } = useI18n();
  const t = dict.account.changeEmail;
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({ email });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNotice(t.uDergua.replace("{email}", email));
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          {notice}
        </p>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t.emailAktual}: {currentEmail}
      </p>

      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t.emailIRi}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="emaili-yt-i-ri@example.com"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 self-start rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {submitting ? t.dukeDergu : t.ndryshoEmailin}
      </button>
    </form>
  );
}

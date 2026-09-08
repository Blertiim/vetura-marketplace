"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/i18n-provider";

export function ChangePasswordForm() {
  const supabase = createClient();
  const { dict } = useI18n();
  const t = dict.account.changePassword;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password.length < 6) {
      setError(t.tShkurter);
      return;
    }
    if (password !== confirm) {
      setError(t.sPerputhen);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNotice(t.uNdryshua);
    setPassword("");
    setConfirm("");
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

      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t.fjalekalimiRi}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>

      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t.perseriteFjalekalimin}
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 self-start rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {submitting ? t.dukeNdryshu : t.ndryshoFjalekalimin}
      </button>
    </form>
  );
}

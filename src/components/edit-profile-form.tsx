"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/i18n-provider";

export function EditProfileForm({
  userId,
  initialFullName,
  initialPhone,
}: {
  userId: string;
  initialFullName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { dict } = useI18n();
  const t = dict.account.editProfile;

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
      .eq("id", userId);

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNotice(t.uRuajt);
    router.refresh();
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
        {t.emriMbiemri}
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>

      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t.numriTelefonit}
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder={t.telefoniPlaceholder}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
          {t.telefoniHint}
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting ? t.dukeRuejt : t.ruajNdryshimet}
      </button>
    </form>
  );
}

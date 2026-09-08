"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OwnerAvatar } from "@/components/owner-avatar";
import { useI18n } from "@/components/i18n-provider";

export function AvatarUploader({
  userId,
  fullName,
  initialAvatarUrl,
}: {
  userId: string;
  fullName: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { dict } = useI18n();
  const t = dict.account.avatar;

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError(t.vetemFoto);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError(t.shumeMadhe);
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    // Cache-bust që fotoja e re me u shfaq menjiherë (URL-i mbetet i njajti
    // path, prandaj browser-i/next-image mundet me e mbajt versionin e vjetër
    // n'cache pa këtë parametër).
    const freshUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: freshUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);

    setUploading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    setAvatarUrl(freshUrl);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <OwnerAvatar name={fullName || "?"} avatarUrl={avatarUrl} size={56} />
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {uploading ? t.dukeNgarku : t.ndryshoFoton}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}

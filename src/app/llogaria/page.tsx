import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/edit-profile-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import { AvatarUploader } from "@/components/avatar-uploader";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Profile } from "@/lib/types";

export default async function AccountPage() {
  const supabase = createClient();
  const dict = getDictionary(getLocale()).account.page;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hyr");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Profile | null;

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-50">{dict.title}</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.fotoProfilit}
          </h2>
          <AvatarUploader
            userId={user.id}
            fullName={typedProfile?.full_name ?? user.email ?? ""}
            initialAvatarUrl={typedProfile?.avatar_url ?? null}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.tDhanatProfilit}
          </h2>
          <EditProfileForm
            userId={user.id}
            initialFullName={typedProfile?.full_name ?? ""}
            initialPhone={typedProfile?.phone ?? ""}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.ndryshoEmailin}
          </h2>
          <ChangeEmailForm currentEmail={user.email ?? ""} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.ndryshoFjalekalimin}
          </h2>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}

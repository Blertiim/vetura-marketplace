import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewListingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hyr");
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-dashed border-slate-300 p-8 text-center">
      <h1 className="mb-2 text-xl font-semibold text-slate-900">
        Formulari i postimit â n&apos;rrugë 🚧
      </h1>
      <p className="text-slate-500">
        Je i loguem si <strong>{user.email}</strong>. Formulari për postim vetur
        (foto, çmim, qytet, kalendar) âsht hapi tjetër që po e ndërtojmë.
      </p>
    </div>
  );
}

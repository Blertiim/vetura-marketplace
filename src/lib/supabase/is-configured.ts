/**
 * True once .env.local has real Supabase credentials. Lets pages show a
 * friendly "setup needed" state instead of crashing during early setup,
 * before the developer has created a Supabase project.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("xxxxxxxxxxxx")
);

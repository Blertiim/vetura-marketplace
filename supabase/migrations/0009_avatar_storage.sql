-- =========================================================
-- Vetura Marketplace — Storage për foton e profilit (avatar)
-- Zbatoje njësoj si migrimet tjera: Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- Krijo bucket-in publik "avatars" (nëse s'ekziston).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Kushdo mundet me i pa avatarët (janë publikë, shifen n'listime etj.).
create policy "avatarët janë publikë"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Useri i loguar ngarkon avatarin vetëm n'folderin e vet (path: <user_id>/...).
create policy "useri i loguar ngarkon avatarin e vet"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Useri i loguar mundet me e ndrrue (rimbishkru) avatarin e vet.
create policy "useri i loguar ndrron avatarin e vet"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Useri i loguar mundet me e fshi avatarin e vet.
create policy "useri i loguar fshin avatarin e vet"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

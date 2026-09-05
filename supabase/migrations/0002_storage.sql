-- =========================================================
-- Vetura Marketplace — Storage për fotot e listimeve
-- Zbatoje pas 0001_init.sql, njësoj: SQL Editor -> New query -> Run
-- =========================================================

-- Krijo bucket-in publik "listing-photos" (nëse s'ekziston).
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Kushdo mundet me i pa fotot (janë publike, si n'çdo marketplace).
create policy "fotot e listimeve janë publike"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

-- Vetëm useri i loguar mundet me ngarku foto, dhe vetëm brenda folderit
-- t'vet (path: <user_id>/<listing_id>/<filename>).
create policy "useri i loguar ngarkon foto n'folderin e vet"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Vetëm pronari i fotos mundet me e fshi.
create policy "pronari fshin fotot e veta"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

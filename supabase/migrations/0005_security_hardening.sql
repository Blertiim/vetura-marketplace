-- =========================================================
-- Forcim sigurie: shto "with check" eksplicit n'policy-t e update-it
-- t'listimeve, që databaza kurrë s'lejon me u ndryshu një listim qi
-- s'âsht i yti — edhe nëse UI-ja ka bug, databaza mbetet e mbrojtun.
-- =========================================================

drop policy if exists "pronari ndryshon listimin e vet" on public.listings;
create policy "pronari ndryshon listimin e vet" on public.listings
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "pronari menaxhon disponueshmërinë" on public.listing_availability;
create policy "pronari menaxhon disponueshmërinë" on public.listing_availability
  for all
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())
  );

drop policy if exists "useri e ndryshon vetëm profilin e vet" on public.profiles;
create policy "useri e ndryshon vetëm profilin e vet" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

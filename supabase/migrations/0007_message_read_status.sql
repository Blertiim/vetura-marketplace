-- =========================================================
-- Shto shenjën "u lexua" për mesazhet, e nevojshme për badge-in
-- e mesazheve t'palexuara n'header.
-- =========================================================
alter table public.messages
  add column if not exists read_at timestamptz;

-- Lejo pjesëmarrësit e bisedës me e shënu një mesazh si "u lexua"
-- (vetëm marrësi mund ta bâjë këtë, jo dërguesi vetë).
drop policy if exists "pjesëmarrësit shënojnë leximin" on public.messages;
create policy "pjesëmarrësit shënojnë leximin" on public.messages
  for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

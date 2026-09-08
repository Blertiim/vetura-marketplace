-- =========================================================
-- Vetura Marketplace — Indekse shtesë për performancë
-- Zbatoje njësoj: Supabase -> SQL Editor -> New query -> Run
--
-- "conversations.buyer_id/seller_id" dhe pyetja e "mesazheve t'palexuara"
-- xhirohen n'ÇDO faqe t'sajtit (badge-i n'header) dhe n'çdo notification
-- t'realtime-it — pa indeks, Postgres duhet me shku rresht-për-rresht
-- (sequential scan) sa herë qi rritet numri i bisedave/mesazheve.
-- =========================================================

create index if not exists conversations_buyer_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_idx on public.conversations (seller_id);

-- Indeks "i pjesshëm" (partial) qi përputhet saktë me pyetjen e badge-it
-- t'mesazheve t'palexuara: "read_at is null" + "conversation_id in (...)".
create index if not exists messages_unread_idx
  on public.messages (conversation_id, sender_id)
  where read_at is null;

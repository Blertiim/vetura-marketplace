-- =========================================================
-- Aktivizo Realtime për tabelën "messages" — pa këtë, chat-i
-- s'i merr mesazhet e reja automatikisht (duhesh ricarku faqen).
-- =========================================================
alter publication supabase_realtime add table public.messages;

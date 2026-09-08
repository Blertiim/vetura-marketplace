-- =========================================================
-- Njoftime me EMAIL kur i vjen dikujt mesazh i ri, ndërsa s'âsht
-- n'app n'atë moment. Dërgohet vetëm herën e parë (jo për çdo
-- mesazh t'ri n't'njajtën "vale" t'palexueme) — kështu s'e mbytim
-- inbox-in e userit.
--
-- Funksionon direkt nga baza e t'dhanave (Postgres trigger + pg_net),
-- prandaj punon edhe kur app-i xhiron vetëm lokal (localhost) — s'ka
-- nevojë me qenë online/deployuar.
-- =========================================================

-- pg_net na lejon me ba kërkesa HTTP prej Postgres-it (drejt Resend-it).
create extension if not exists pg_net;

-- -----------------------------------------------------------
-- 1) Lexo çelësin sekret t'Resend-it prej Vault-it (jo prej kodit!)
--    Ruajtja e çelësit bahet 1 herë, manualisht, n'SQL Editor — shih
--    udhëzimet n'README/SI_TE_FILLOSH.md.
-- -----------------------------------------------------------
create or replace function public.get_app_secret(secret_name text)
returns text
language sql
security definer
set search_path = public, vault
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = secret_name
  limit 1;
$$;

-- -----------------------------------------------------------
-- 2) Trigger-i qi dërgon email-in kur futet mesazh i ri.
-- -----------------------------------------------------------
create or replace function public.notify_new_message_email()
returns trigger
language plpgsql
security definer
set search_path = public, vault, net
as $$
declare
  v_conversation record;
  v_recipient_id uuid;
  v_recipient_email text;
  v_recipient_name text;
  v_sender_name text;
  v_listing_title text;
  v_already_unread boolean;
  v_api_key text;
  v_preview text;
  v_app_url text := 'http://localhost:3000';
begin
  begin
    select * into v_conversation
    from public.conversations
    where id = new.conversation_id;

    if not found then
      return new;
    end if;

    -- marrësi âsht ai qi S'e ka dergu mesazhin
    if v_conversation.buyer_id = new.sender_id then
      v_recipient_id := v_conversation.seller_id;
    else
      v_recipient_id := v_conversation.buyer_id;
    end if;

    -- nëse marrësi ka tashmë nji mesazh tjetër t'palexuem prej t'njajtit
    -- dërgues n't'njajtën bisedë, e kena njoftu tashmë — s'dergo t'ri.
    select exists(
      select 1 from public.messages
      where conversation_id = new.conversation_id
        and sender_id = new.sender_id
        and read_at is null
        and id <> new.id
    ) into v_already_unread;

    if v_already_unread then
      return new;
    end if;

    -- email-i i marrësit rrin n'auth.users (jo n'profiles).
    select email into v_recipient_email
    from auth.users
    where id = v_recipient_id;

    if v_recipient_email is null then
      return new;
    end if;

    select full_name into v_recipient_name from public.profiles where id = v_recipient_id;
    select full_name into v_sender_name from public.profiles where id = new.sender_id;
    select title into v_listing_title from public.listings where id = v_conversation.listing_id;

    v_api_key := public.get_app_secret('resend_api_key');
    if v_api_key is null then
      -- çelësi ende s'âsht konfiguru — s'ka pse me dështu dërgimin e mesazhit.
      return new;
    end if;

    v_preview := left(new.body, 200);

    perform net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_api_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'from', 'Vetura <onboarding@resend.dev>',
        'to', jsonb_build_array(v_recipient_email),
        'subject', coalesce(v_sender_name, 'Dikush') || ' t''ka dërgu nji mesazh n''Vetura',
        'html',
          '<div style="font-family:sans-serif;font-size:14px;color:#0f172a;">' ||
          '<p>Përshëndetje' || case when v_recipient_name is not null then ' ' || v_recipient_name else '' end || ',</p>' ||
          '<p><strong>' || coalesce(v_sender_name, 'Dikush') || '</strong> t''ka dërgu nji mesazh t''ri' ||
            case when v_listing_title is not null then ' rreth <strong>' || v_listing_title || '</strong>' else '' end ||
          ':</p>' ||
          '<blockquote style="border-left:3px solid #0ea5e9;padding-left:12px;margin-left:0;color:#475569;">' ||
            v_preview ||
          '</blockquote>' ||
          '<p><a href="' || v_app_url || '/mesazhet/' || new.conversation_id || '" ' ||
            'style="display:inline-block;background:#0ea5e9;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;">' ||
            'Përgjigju n''Vetura</a></p>' ||
          '</div>'
      )
    );
  exception when others then
    -- kurrsesi mos e prish dërgimin e mesazhit për shkak t'njoftimit me email.
    raise warning '[notify_new_message_email] gabim: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_new_message_send_email on public.messages;
create trigger on_new_message_send_email
  after insert on public.messages
  for each row execute function public.notify_new_message_email();

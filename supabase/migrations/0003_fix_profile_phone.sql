-- =========================================================
-- Fix: numri i telefonit s'po ruhej n'profile kur regjistrohej useri
-- (trigger-i fillestar kopjonte vetëm full_name, jo phone).
-- Zbatoje pas 0001 dhe 0002.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Përditso profilet ekzistuese që tashmë janë krijuar pa telefon
-- (p.sh. useri test qi u regjistru para këtij fix-i).
update public.profiles p
set phone = u.raw_user_meta_data ->> 'phone'
from auth.users u
where p.id = u.id
  and p.phone is null
  and u.raw_user_meta_data ->> 'phone' is not null;

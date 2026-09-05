-- =========================================================
-- Vetura Marketplace — schema fillestare
-- Zbatoje këtë file në Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- =========================================================

-- ---------------------------------------------------------
-- 1) Profiles (shtesë e auth.users, që Supabase e menaxhon vetë)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Të dhëna shtesë për çdo user, që s''i ka Supabase Auth vetë.';

-- Krijo automatikisht një rresht profile kur regjistrohet një user i ri.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 2) Vendet dhe qytetet (Shqipëri, Kosovë, Maqedoni)
-- ---------------------------------------------------------
create table if not exists public.countries (
  id smallint primary key,
  code text not null unique,   -- 'AL', 'XK', 'MK'
  name text not null           -- 'Shqipëri', 'Kosovë', 'Maqedoni e Veriut'
);

create table if not exists public.cities (
  id serial primary key,
  country_id smallint not null references public.countries (id),
  name text not null,
  unique (country_id, name)
);

insert into public.countries (id, code, name) values
  (1, 'AL', 'Shqipëri'),
  (2, 'XK', 'Kosovë'),
  (3, 'MK', 'Maqedoni e Veriut')
on conflict (id) do nothing;

insert into public.cities (country_id, name) values
  -- Shqipëri
  (1, 'Tiranë'), (1, 'Durrës'), (1, 'Vlorë'), (1, 'Shkodër'), (1, 'Sarandë'),
  (1, 'Elbasan'), (1, 'Fier'), (1, 'Korçë'), (1, 'Berat'), (1, 'Lushnjë'),
  -- Kosovë
  (2, 'Prishtinë'), (2, 'Prizren'), (2, 'Pejë'), (2, 'Gjakovë'), (2, 'Ferizaj'),
  (2, 'Gjilan'), (2, 'Mitrovicë'), (2, 'Vushtrri'), (2, 'Podujevë'),
  -- Maqedoni e Veriut
  (3, 'Shkup'), (3, 'Tetovë'), (3, 'Gostivar'), (3, 'Kumanovë'), (3, 'Strugë'), (3, 'Dibër')
on conflict do nothing;

-- ---------------------------------------------------------
-- 3) Listimet e veturave
-- ---------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  brand text not null,
  model text not null,
  year int not null check (year between 1970 and extract(year from now())::int + 1),
  price_amount numeric(10, 2) not null check (price_amount >= 0),
  price_unit text not null default 'day' check (price_unit in ('day', 'week')),
  city_id int not null references public.cities (id),
  description text,
  mileage_km int,
  condition text,
  status text not null default 'active' check (status in ('active', 'paused', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_city_idx on public.listings (city_id);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_price_idx on public.listings (price_amount);
create index if not exists listings_owner_idx on public.listings (owner_id);

-- ---------------------------------------------------------
-- 4) Fotot e listimit
-- ---------------------------------------------------------
create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists listing_photos_listing_idx on public.listing_photos (listing_id);

-- ---------------------------------------------------------
-- 5) Periudhat e disponueshmërisë (kalendari)
-- ---------------------------------------------------------
create table if not exists public.listing_availability (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  created_at timestamptz not null default now()
);

create index if not exists listing_availability_listing_idx on public.listing_availability (listing_id);
create index if not exists listing_availability_dates_idx on public.listing_availability (start_date, end_date);

-- ---------------------------------------------------------
-- 6) Biseda / mesazhe (chat brenda app-it)
-- ---------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------
-- 7) Të preferuarat (favorites) — opsionale, e dobishme që n'fillim
-- ---------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- =========================================================
-- ROW LEVEL SECURITY — kjo âsht pjesa qi e mban t'dhanat e sigurta
-- =========================================================
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.listing_availability enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;

-- Profiles: kushdo mundet me i lexu profilet (emri publik), por vetëm
-- pronari mundet me e ndryshu t'veten.
create policy "profiles janë publike për lexim" on public.profiles
  for select using (true);
create policy "useri e ndryshon vetëm profilin e vet" on public.profiles
  for update using (auth.uid() = id);

-- Listings: gjithkush i sheh listimet aktive; vetëm useri i loguar
-- mundet me krijue listim, dhe vetëm pronari mundet me e ndryshu/fshi.
create policy "listimet aktive janë publike" on public.listings
  for select using (status = 'active' or owner_id = auth.uid());
create policy "user i loguar krijon listim" on public.listings
  for insert with check (auth.uid() = owner_id);
create policy "pronari ndryshon listimin e vet" on public.listings
  for update using (auth.uid() = owner_id);
create policy "pronari fshin listimin e vet" on public.listings
  for delete using (auth.uid() = owner_id);

-- Photos & availability: dukshmëria ndjek listimin; ndryshimi vetëm nga pronari.
create policy "fotot janë publike" on public.listing_photos
  for select using (true);
create policy "pronari shton foto" on public.listing_photos
  for insert with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())
  );
create policy "pronari fshin foto" on public.listing_photos
  for delete using (
    exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())
  );

create policy "disponueshmëria âsht publike" on public.listing_availability
  for select using (true);
create policy "pronari menaxhon disponueshmërinë" on public.listing_availability
  for all using (
    exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())
  );

-- Conversations & messages: vetëm pjesëmarrësit i shohin.
create policy "pjesëmarrësit shohin bisedën" on public.conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "blerësi fillon bisedën" on public.conversations
  for insert with check (auth.uid() = buyer_id);

create policy "pjesëmarrësit shohin mesazhet" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
create policy "pjesëmarrësit dërgojnë mesazhe" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Favorites: vetëm useri i vet i sheh/menaxhon.
create policy "useri i vet i sheh favoritet" on public.favorites
  for select using (auth.uid() = user_id);
create policy "useri i vet i menaxhon favoritet" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Countries/cities: referencë publike, pa RLS (lexim i lirë për t'gjithë).
grant select on public.countries, public.cities to anon, authenticated;

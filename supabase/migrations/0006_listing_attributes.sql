-- =========================================================
-- Shto atribute shtesë t'veturës (frymëzuar nga filtrat e MerrJep),
-- t'dobishme për filtrim: transmisioni, karburanti, ngjyra, karoceria.
-- =========================================================

alter table public.listings
  add column if not exists transmission text check (transmission in ('manuale', 'automatike')),
  add column if not exists fuel_type text check (fuel_type in ('benzinë', 'dizel', 'hibrid', 'elektrike', 'gaz')),
  add column if not exists color text,
  add column if not exists body_type text check (
    body_type in (
      'Veturë e vogël', 'Sedan', 'Hatchback', 'Universal',
      'Kupe', 'Kabriolet', 'SUV', 'Minivan'
    )
  );

create index if not exists listings_year_idx on public.listings (year);
create index if not exists listings_transmission_idx on public.listings (transmission);
create index if not exists listings_fuel_type_idx on public.listings (fuel_type);
create index if not exists listings_body_type_idx on public.listings (body_type);

# Vetura — Marketplace veturash për verë

Web-app ku përdoruesit regjistrohen, postojnë veturën e vet, dhe hin n'kontakt
me njëri-tjetrin. Ndërtue me **Next.js 14** + **TypeScript** + **Tailwind CSS**
+ **Supabase** (databaza Postgres, autentikimi, dhe storage për fotot).

## Çka â gati tash

- Faqja kryesore me listë veturash + filtër shteti/qyteti/çmimi (Shqipëri, Kosovë, Maqedoni)
- Regjistrim + hyrje (email + fjalëkalim, via Supabase Auth)
- Schema e plotë e databazës me Row Level Security (`supabase/migrations/0001_init.sql`)

## Çka vjen m'pas

- Formulari i postimit t'veturës (foto, kalendar disponueshmërie)
- Faqja e detajeve t'listimit + buton "Kontakto n'WhatsApp/Viber"
- Chat brenda app-it
- Premium/subscription (m'von)

---

## Hapat për me e nis lokal n'kompjuterin tand

### 1. Instalo paketat

Hap terminal (Command Prompt / PowerShell) n'folderin e projektit dhe shkruj:

```
npm install
```

### 2. Krijo llogari + projekt në Supabase (falas)

1. Shko në [supabase.com](https://supabase.com) dhe krijo llogari falas (mundesh me hy me GitHub).
2. Kliko **New Project**. Zgjedh emër (p.sh. `vetura`), fjalëkalim për databazën (ruaje diku), dhe rajonin m'afër (p.sh. Frankfurt).
3. Prit ~2 minuta sa t'krijohet projekti.
4. Shko te **Project Settings → API**. Aty i gjen:
   - **Project URL** → kjo â `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → kjo â `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Konfiguro variablat e environment-it

Kopjo `env-template.txt` si `.env.local`:

```
copy env-template.txt .env.local
```

Hape `.env.local` dhe fut vlerat prej Supabase (hapi 2).

### 4. Zbato schema e databazës

1. N'Supabase dashboard, shko te **SQL Editor → New query**.
2. Hap file-in `supabase/migrations/0001_init.sql` prej këtij projekti, kopjo krejt përmbajtjen, ngjite n'SQL Editor, dhe kliko **Run**.
3. Kjo krijon t'gjitha tabelat (profiles, listings, cities, etj.) + sigurinë (RLS).

### 5. Nise projektin

```
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000) n'browser. Duhesh me pa faqen kryesore (bosh n'fillim, sepse s'ka listime akoma) dhe mundesh me u regjistru.

---

## GitHub — si me e ruajt kodin me histori

1. Krijo një repository t'ri (bosh, pa README) n'[github.com/new](https://github.com/new), p.sh. me emrin `vetura-marketplace`.
2. N'terminal, brenda folderit t'projektit:

```
git init
git add .
git commit -m "Fillimi i projektit: Next.js + Supabase skeleton"
git branch -M main
git remote add origin https://github.com/<useri-yt>/vetura-marketplace.git
git push -u origin main
```

(Herën e parë GitHub ka me kërku me u loguem — ndiq udhëzimet n'ekran ose përdor
[gh CLI](https://cli.github.com/) nëse din me e instalu.)

Prej tani e tutje, çdo herë qi bahen ndryshime:

```
git add .
git commit -m "përshkrim i shkurtë i ndryshimit"
git push
```

---

## Publikimi (deployment) — kur t'jesh gati

Rekomandimi: **[Vercel](https://vercel.com)** — falas, e ndërtue nga i njëjti ekip si Next.js, lidhet direkt me GitHub repo-n tande dhe publikohet automatikisht me çdo push.

1. Krijo llogari n'Vercel (hyr me GitHub).
2. **Add New Project** → zgjedh repo-n `vetura-marketplace`.
3. Shto t'njëjtat variabla environment (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) n'settings-at e projektit n'Vercel.
4. Deploy. Do t'kesh një link publik (p.sh. `vetura-marketplace.vercel.app`).

---

## Struktura e projektit

```
src/
  app/              → faqet (App Router i Next.js)
  components/       → pjesë t'ripërdorshme t'UI-t
  lib/supabase/     → klientët e Supabase (browser + server)
  lib/types.ts      → tipet TypeScript t'databazës
supabase/
  migrations/       → SQL schema, run manualisht n'Supabase SQL Editor
```

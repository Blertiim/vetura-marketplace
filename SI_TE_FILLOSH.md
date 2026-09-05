# Si me e nis projektin — udhëzim hap-pas-hapi për fillestarë

Ky udhëzim supozon që s'ke përdorë kurrë terminal apo git. Ndiq çdo hap me radhë,
mos i kapërce.

---

## HAPI 1 — Hap terminalin (Command Prompt) te folderi i projektit

1. Hap **File Explorer** dhe shko te `Documents\vetura-marketplace` (aty i ke krejt file-t që t'i dërgova).
2. N'shiritin e adresës n'krye (aty ku shkruen path-in, p.sh. `Documents > vetura-marketplace`), **kliko një herë me të majtën** që të selektohet krejt teksti.
3. Shkruaj `cmd` dhe shtyp **Enter**.
4. Do t'hapet një dritare e zezë (Command Prompt) — kjo âsht terminali. Duhesh me pa diçka si:
   ```
   C:\Users\blert\Documents\vetura-marketplace>
   ```
   Kjo don me thanë je tashma "brenda" folderit t'projektit. Krejt komandat e mëposhtme i shkruen aty, mandej shtyp Enter.

---

## HAPI 2 — Instalo Node.js (nëse s'e ke)

1. N'terminal shkruaj: `node --version` dhe shtyp Enter.
2. Nëse t'del një numër (p.sh. `v20.11.0`), e ke tashma — kalo te Hapi 3.
3. Nëse t'del gabim ("nuk njihet komanda"), shko te [nodejs.org](https://nodejs.org), shkarko versionin **LTS**, instaloje (Next, Next, Install, Finish), mbylle terminalin dhe rihape (Hapi 1) — mandej provo prap `node --version`.

---

## HAPI 3 — Instalo paketat e projektit

N'terminal (brenda `vetura-marketplace`) shkruaj:

```
npm install
```

Shtyp Enter dhe prit — do t'shkruen shumë rreshta teksti, kjo âsht normale. Zgjatë 1-3 minuta. Kur t'mbaron, prap sheh promptin `...vetura-marketplace>`. Nëse s'ka shkru "error" të kuqe n'fund, ka funksionu.

---

## HAPI 4 — Krijo llogari falas n'Supabase (databaza)

1. Hap browser-in, shko te **[supabase.com](https://supabase.com)**.
2. Kliko **Start your project** (butoni jeshil/lartë).
3. Kliko **Sign in with GitHub** (m'i shpejt) ose regjistrohu me email.
4. Pasi hyn, kliko **New Project**.
5. Plotëso:
   - **Name**: `vetura` (ose çfarëdo emri)
   - **Database Password**: shkruaj një fjalëkalim dhe **RUAJE diku** (p.sh. n'Notes) — s'të duhet tash, por mund t'duhet m'von.
   - **Region**: zgjedh m'afërt gjeografikisht (p.sh. Frankfurt (eu-central-1))
6. Kliko **Create new project**.
7. Prit 1-2 minuta sa Supabase e përgatit projektin (sheh një "loading" animacion).

---

## HAPI 5 — Merr çelësat (keys) e Supabase

1. Kur projekti âsht gati, n'anën e majtë kliko ikonën e **Settings** (rrota/gearwheel, poshtë fare).
2. Kliko **API**.
3. Aty do t'shohësh dy gjana që na duhen:
   - **Project URL** — diçka si `https://abcdefgh.supabase.co`
   - **anon public** (nën "Project API keys") — një varg i gjatë shkronjash/numrash që fillon me `eyJ...`
4. Lëri këtë faqe hapun — do na duhen n'hapin tjetër.

---

## HAPI 6 — Krijo file-in `.env.local`

1. Kthehu te File Explorer, te folderi `vetura-marketplace`.
2. Gjej file-in `env-template.txt`, **kopjoje** (Ctrl+C, Ctrl+V) — do t'krijohet `env-template - Copy.txt`.
3. Riemërtoje kopjen n'saktësisht: `.env.local` (kujdes — pika n'fillim âsht e domosdoshme, dhe s'ka `.txt` n'fund).
   - Nëse Windows s'të lejon me hjek `.txt`, shko te File Explorer → View → shëno kutinë "File name extensions" — mandej mundesh me e ndryshu emrin plotësisht.
4. Hape `.env.local` me **Notepad** (klik i djathtë → Open with → Notepad).
5. Zëvendëso vlerat shembull me ato t'vërteta prej Hapit 5:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...(vargu i gjatë)
   ```
6. **Save** (Ctrl+S) dhe mbylle Notepad-in.

---

## HAPI 7 — Krijo tabelat n'databazë

1. Kthehu te Supabase n'browser.
2. N'anën e majtë kliko **SQL Editor** (ikona `</>`).
3. Kliko **New query**.
4. Kthehu te File Explorer → `vetura-marketplace\supabase\migrations\0001_init.sql` → hape me Notepad → **selekto krejt tekstin** (Ctrl+A) → **kopjo** (Ctrl+C).
5. Kthehu te Supabase SQL Editor, **ngjit** (Ctrl+V) brenda kutisë bosh.
6. Kliko butonin **Run** (poshtë-djathtas, ose Ctrl+Enter).
7. Duhesh me pa mesazh jeshil "Success. No rows returned". Kjo don me thanë tabelat janë krijuar.

---

## HAPI 8 — Nise projektin dhe teste

1. Kthehu te terminali (dritarja e zezë prej Hapit 1).
2. Shkruaj:
   ```
   npm run dev
   ```
3. Prit sa t'shohësh diçka si `Ready in 2.3s` dhe `Local: http://localhost:3000`.
4. Hap browser-in dhe shko te **http://localhost:3000**.
5. Duhesh me pa faqen kryesore t'app-it ("Gjej një veturë për verë") — bosh n'listime, kjo âsht normale sepse s'ka listime akoma.
6. Kliko **Regjistrohu** n'krye djathtas, plotëso formularin, dhe testo nëse funksionon.

**Për me e ndalë serverin**: n'terminal shtyp `Ctrl + C`.
**Për me e rinis m'von**: hap terminalin te folderi (Hapi 1) dhe shkruaj prap `npm run dev`.

---

## Nëse diçka s'punon

Kopjo mesazhin e gabimit (error) qi t'del n'terminal ose n'browser dhe m'ja dërgo mua — e analizojmë bashkë.

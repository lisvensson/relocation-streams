# 🧭 Flyttströmmar

Ett internt analysverktyg för att visualisera företagsflyttar i Sverige.

Flyttströmmar gör det möjligt att snabbt filtrera, generera och spara rapporter baserade på företagsflyttar, branschkluster, anställdas storlek, årtal och geografiska områden.

---

## 📚 Innehållsförteckning (uppdaterad)

- [🚀 Kom igång](#-kom-igång)
- [🧱 Arkitektur](#-arkitektur)
- [🧭 Vad kan man göra i verktyget?](#-vad-kan-man-göra-i-verktyget)
- [💻 Tech Stack](#-tech-stack)

---

## 🚀 Kom igång

**Innan du börjar behöver du:**

- Node.js 18 eller senare
- En PostgreSQL‑databas — skapa ett projekt på [neon.tech](https://neon.tech), eller kör `docker-compose up -d` för en lokal databas med den medföljande Docker Compose‑filen

### 1. Klona projektet

```bash
git clone <repo-url>
cd flyttstrommar
```

### 2. Installera beroenden

```bash
npm install
```

### 3. Skapa miljöfil

```bash
cp .env.example .env
```

Fyll sedan i följande variabler:

| Variabel              | Beskrivning                                     |
| --------------------- | ----------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL‑anslutningssträng                    |
| `BETTER_AUTH_SECRET`  | Hemlig nyckel för att signera användarsessioner |
| `BETTER_AUTH_URL`     | Appens bas‑URL (t.ex. `http://localhost:5173`)  |
| `RESEND_API_KEY`      | API‑nyckel för e‑posttjänsten Resend            |
| `SEND_OTP_EMAIL_FROM` | Avsändaradress för inloggningsmail              |

### 4. Migrera databasen

```bash
npm run db:migrate
```

> Under utveckling kan `npm run db:push` användas för att synka schemaändringar direkt utan att generera migreringsfiler.
>
> För att bläddra i databasen visuellt: `npm run db:studio`

### 5. Starta utvecklingsservern

```bash
npm run dev
```

Applikationen körs på:  
http://localhost:5173

---

## 🧱 Arkitektur

Applikationen följer ett klassiskt fullstack-mönster där varje sida (route) ansvarar för både dataladdning och rendering.

```
app/
├── routes/         # Sidor: hem, rapporter, rapport, inloggning, delad vy
├── lib/            # Serverlogik: bygga diagram, hantera filter, dela rapporter
├── components/     # Delade UI-komponenter
├── middleware/     # Autentiseringsskydd för inloggade sidor
└── shared/
    ├── auth/       # Konfiguration av Better Auth och OTP-utskick
    └── database/   # Databasuppkoppling, schema och diagrambyggare
```

Rapportdata lagras i PostgreSQL med fyra huvudtabeller: `reports`, `charts`, `shared_reports` och `relocation`. Kärntabellen `relocation` innehåller alla företagsflyttar och är indexerad för snabba frågor.

Delade rapporter är frysta snapshots — de uppdateras inte automatiskt när originalrapporten ändras. Innehållet fryses vid delningstillfället och uppdateras bara om ägaren sparar rapporten på nytt.

---

## 🧭 Vad kan man göra i verktyget?

- Skapa rapporter med valfritt namn och beskrivning
- Filtrera data på år, företagsstorlek, företagstyp och branschkluster
- Lägga till interaktiva diagram: tidsserie, kategorifördelning, nettoflöde och kombinerade vyer
- Förhandsgranska rapporten i ett låst läsläge
- Dela rapporten via en publik länk — mottagaren behöver inte logga in
- Hantera alla sina rapporter från en samlad översikt

---

## 💻 Tech Stack

### 🧩 Framework & UI

- **React Router v7**
- **React**
- **Tailwind CSS**
- **shadcn/ui**

### 🗄️ Data & Server

- **Drizzle ORM**
- **PostgreSQL**

### 🔐 Autentisering

- **Better Auth**

### 🛠️ Dev Experience

- **TypeScript**
- **ESLint & Prettier**
- **Vite**

---

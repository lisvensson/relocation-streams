# Handover Document — Relocation Streams

Welcome. This document is written for the developer taking over this project. It covers everything you need to get up and running, understand the codebase, and continue the work.

---

## About the project

**Relocation Streams** is a web application for analyzing business relocation patterns in Sweden. It lets users create custom reports with interactive charts that show how companies have moved between postal areas, municipalities, and counties over time.

Reports can be filtered by year, employee count, company type, and industry cluster. Once a report is ready, it can be shared publicly via a link — without requiring the viewer to log in.

The app exists as an internal analytics tool. All relocation data lives in a PostgreSQL database. There is no external data API — everything is queried directly from that database.

---

## Getting started

You should be comfortable with Node.js, npm, and working in the terminal.

**Before you start, you will need:**

- Node.js 18 or later
- A PostgreSQL database — either sign up at [neon.tech](https://neon.tech) and create a project, or run `docker-compose up -d` to start a local database using the included Docker Compose file

### 1. Clone the repository

```bash
git clone <repository-url>
cd relocation-streams
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy or create a `.env` file in the project root. See the [Environment variables](#environment-variables-and-configuration) section below for what to put in it.

### 4. Set up the database

Run the database migrations to create all tables:

```bash
npm run db:migrate
```

> If you're iterating on the schema during development, `npm run db:push` applies schema changes directly without generating migration files.
>
> To browse the database visually: `npm run db:studio`

### 5. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### Logging in

Authentication is email-based with one-time codes (OTP) — there are no passwords. Enter your email address, and you will receive a 6-digit code to complete sign-in. This requires the Resend service to be configured (see environment variables below).

---

## Environment variables and configuration

All variables go in a `.env` file in the project root. The app will start without them but will fail at runtime if any are missing.

| Variable              | What it does                                       | Where to find it                                                |
| --------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string for the main database | Neon dashboard → your project → Connection string               |
| `BETTER_AUTH_SECRET`  | Secret key used to sign user sessions              | Generate any long random string, e.g. `openssl rand -base64 32` |
| `BETTER_AUTH_URL`     | Base URL of the app, used for auth callbacks       | `http://localhost:5173` locally; your production URL in prod    |
| `RESEND_API_KEY`      | API key for the Resend email service               | [resend.com](https://resend.com) → API Keys                     |
| `SEND_OTP_EMAIL_FROM` | The sender address for login emails                | A sender address verified in your Resend account                |

**Important:** If any of these are missing, the app will start without warning but break at the first login attempt or database query. There is currently no startup validation.

---

## Project structure

```
relocation-streams/
├── app/
│   ├── routes/              # Every page in the app lives here
│   ├── lib/                 # Server-side helper functions
│   ├── components/          # Shared UI components
│   ├── middleware/          # Authentication guard
│   ├── shared/
│   │   ├── auth/            # Login/session setup (Better Auth)
│   │   └── database/        # DB connection, schema, chart builders, and tests
│   ├── routes.ts            # Defines which URL maps to which route file
│   └── root.tsx             # HTML shell, global fonts and styles
├── drizzle/                 # Auto-generated SQL migration files
├── data/                    # Static reference data
├── public/                  # Static assets served as-is
├── drizzle.config.ts        # Drizzle ORM configuration
├── react-router.config.ts   # Framework configuration
└── vite.config.ts           # Build tool configuration
```

### Routes (pages)

| File               | URL                  | Purpose                                                                       |
| ------------------ | -------------------- | ----------------------------------------------------------------------------- |
| `home.tsx`         | `/`                  | Dashboard. Create a new report from here.                                     |
| `Reports.tsx`      | `/rapporter`         | List of all your reports. Edit, share, duplicate, or delete.                  |
| `Report.tsx`       | `/rapport/:id`       | The report editor. Add charts, set filters, share the report.                 |
| `ReportView.tsx`   | `/visa-rapport/:id`  | Read-only preview of a report.                                                |
| `ReportShared.tsx` | `/delad-rapport/:id` | Public shared report view. No login required.                                 |
| `SignIn.tsx`       | `/logga-in`          | Email sign-in form.                                                           |
| `SignInOtp.tsx`    | `/logga-in/kod`      | Enter the one-time code sent to your email.                                   |
| `shell.tsx`        | (layout)             | Wraps all authenticated pages. Handles the auth check and renders the navbar. |

### Key library files (`app/lib/`)

| File                           | What it does                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `buildChartsByType.ts`         | Central dispatcher — given a chart config, calls the right builder function. **If you add a new chart type, register it here.** |
| `buildChartConfig.ts`          | Parses a submitted form into a chart configuration object.                                                                      |
| `buildSharedReportSnapshot.ts` | Rebuilds all charts for a report and saves the result as a snapshot for sharing.                                                |
| `updateSharedSnapshot.ts`      | Writes an updated snapshot to the database.                                                                                     |
| `saveReportFilters.ts`         | Saves the current location and filter selections to the report.                                                                 |
| `getLocations.ts`              | Fetches all available postal areas, municipalities, and counties from the database. Results are cached for 24 hours.            |
| `getFilterOptions.ts`          | Returns the available filter options (years, employee ranges, company types, industry clusters).                                |
| `generateChartTitle.ts`        | Generates a human-readable Swedish title for a chart based on its configuration.                                                |

### Chart builders (`app/shared/database/buildCharts/`)

These are the four functions that query the database and return chart data:

| File                            | Chart type                                                 |
| ------------------------------- | ---------------------------------------------------------- |
| `buildTemporalChart.ts`         | Simple time series (inflow or outflow per year)            |
| `buildCategoryChart.ts`         | Data grouped by one category (pie or bar)                  |
| `buildNetFlowCategoryChart.ts`  | Net flow (inflow − outflow) per category                   |
| `buildTemporalCategoryChart.ts` | Time series broken down by category (the most complex one) |

---

## Important to know

These are things that are not obvious from reading the code.

### Location filtering: inflow uses "from", outflow uses "to"

This is the most critical business rule in the data layer. When filtering chart data by a geographic category (postal area, municipality, county):

- **Inflow** queries the `fromLocation` field — companies that _moved into_ the selected area
- **Outflow** queries the `toLocation` field — companies that _left_ the selected area

This logic appears in three of the four chart builders. If you add a new chart type or modify location queries without keeping this rule, you will get geographically inverted data with no error or warning.

### The `relocationYear` column is computed

In the `relocation` table, `relocationYear` is automatically derived from `relocationDate` using a database-generated expression. You cannot insert into it directly. All chart builders use this column for year-based filtering and grouping.

### `netflow` is only partially implemented

The `Measure` type includes `'netflow'`, but two of the four chart builders (`buildTemporalChart` and `buildCategoryChart`) do not support it — they return empty results silently. Netflow only works with the "net flow by category" and "time series by category" chart types. This was a known limitation and was not fully resolved.

### Shared reports are snapshots, not live views

When a report is shared, the app builds all its charts at that moment and saves the output as a JSON blob. The shared link shows that frozen snapshot — it does not update automatically when the original report changes. The snapshot is only rebuilt when the owner saves the report again. There is no expiry or scheduled refresh.

### The snapshot save is not transactional

When saving a report with sharing enabled, three things happen in sequence: (1) filters are saved, (2) charts are rebuilt, (3) the snapshot is written. If step 2 or 3 fails, step 1 has already committed. The user is not always shown an error in this case, and the shared report may be left showing stale data. This is a known limitation.

### Years are hardcoded

The available year range for filtering (2014–2025) is a hardcoded array in `app/lib/getFilterOptions.ts`. When data for 2026 arrives, this list must be updated manually, or users will not be able to filter for the new year. Ideally this should be derived from the database.

---

## Known issues and next steps

### Things that are incomplete

- **Netflow in simple charts**: `buildTemporalChart` and `buildCategoryChart` silently ignore the netflow measure. These need implementing or the option should be removed from the UI for those chart types.

- **OTP auth handles only sign-in**: The email handler in `app/shared/auth/index.ts` only sends a proper email for `type === 'sign-in'`. Other auth types fall through without sending anything.

- **Commented-out Microsoft OAuth**: There is a commented-out Microsoft login button in `app/routes/SignIn.tsx`. Either implement it properly or remove it.

- **Hardcoded year range**: `app/lib/getFilterOptions.ts` — the year array should be generated dynamically from the database.

### Things to clean up

- **Filter form duplication**: In `Report.tsx`, the same filter serialization logic is copy-pasted across three separate form submissions. This should be extracted into a shared utility.

- **Missing startup validation**: If a required environment variable is missing, the app gives no warning until something breaks at runtime. Add a startup check.

### Worth considering

- Add rate limiting to the public shared report route (`/delad-rapport/:id`) — currently anyone can probe it without restriction.
- Add an expiry or manual revocation option for shared reports.
- Consider wrapping the snapshot save (filters → build charts → write snapshot) in a proper error-handling flow so partial failures are surfaced to the user.

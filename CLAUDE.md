# CLAUDE.md — EcoLur Project Context

This file is read automatically by Claude Code at the start of every session on this repo. It provides full context so it doesn't need to be re-explained every time a new session starts.

## About the project

**EcoLur** (*"Eco"* + *"Lur"*, from **Jatikulur**, Gunung Putri, Kabupaten Bogor — the pilot area) — a web platform for smart sustainable digital solutions for an inclusive society, combining two modules:
1. **Energy module (SDG 7)** — citizens input electricity consumption, get AI-powered energy-saving recommendations.
2. **Public service module (SDG 11)** — citizens report city infrastructure issues, officers verify & update status, local government monitors an aggregate dashboard.

Preliminary round submission deadline: **September 6, 2026, 23:59 WIB**. Deliverable: GitHub repo (with README.md) + live hosting link.

## Tech stack decisions (final — don't change without a strong reason)

- **Next.js 14+ App Router + TypeScript** — fullstack in one app (frontend + API routes), so deployment to Vercel is a single project with a single hosting link.
- **PostgreSQL + Prisma ORM** — hosted for free on Neon or Supabase.
- **Tailwind CSS** — styling; avoid heavy UI kits that add unnecessary bundle size.
- **Leaflet.js + OpenStreetMap** for maps — NOT Google Maps API (to avoid needing billing/a paid API key).
- **Google Gemini API** (free tier, Flash/Flash-Lite models) — for AI features. Never call it directly from the client (API key must live server-side/in API routes only, never exposed to the browser).
- **Phone number-based OTP** for auth — for the competition MVP, OTP can be simulated (a static code in development, or a free service like Fonnte for WhatsApp OTP if time allows).

Why Next.js fullstack instead of a separate Express/Laravel backend: the competition requires a single free hosting link (Vercel/Netlify) that stays stable for judging — a monorepo architecture carries less deployment risk when the deadline is close.

## Folder structure (follow this pattern)

```
app/
  (auth)/login/page.tsx
  (citizen)/
    energy/page.tsx
    report/page.tsx
    my-reports/page.tsx
  (officer)/
    incoming-reports/page.tsx
  (admin)/
    dashboard/page.tsx
  api/
    auth/route.ts
    energy-logs/route.ts
    reports/route.ts
    reports/[id]/status/route.ts
    ai/recommend/route.ts
    ai/summarize/route.ts
components/
lib/
  db.ts        # Prisma client singleton
  auth.ts      # OTP + session helper
  ai.ts        # Gemini API call wrapper — DO NOT hardcode the API key in this file
prisma/
  schema.prisma
```

## Database schema (Prisma) — required reference

See the full relationship diagram in `ARCHITECTURE.md`. The live source of truth is
`prisma/schema.prisma` — kept in sync with the block below; if they ever drift, trust the
`.prisma` file and update this block to match, don't "fix" the file back to this text.

```prisma
model User {
  id         String      @id @default(uuid())
  name       String
  phone      String      @unique
  role       Role        @default(CITIZEN)
  rtRw       String?
  createdAt  DateTime    @default(now())
  energyLogs EnergyLog[]
  reports    Report[]
  badges     Badge[]
  // Present only when this User also has an Officer profile (role should be OFFICER).
  officer    Officer?

  @@index([role])
}

enum Role {
  CITIZEN
  OFFICER
  ADMIN
}

model EnergyLog {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  period         String // format: "2026-08"
  consumptionKwh Float
  costEstimate   Float
  co2Estimate    Float
  createdAt      DateTime @default(now())

  // One entry per user per month — resubmitting the same period updates it instead of duplicating.
  @@unique([userId, period])
  @@index([userId, period])
}

model Report {
  id          String            @id @default(uuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id])
  category    String
  description String
  photoUrl    String?
  lat         Float
  lng         Float
  status      ReportStatus      @default(REPORTED)
  createdAt   DateTime          @default(now())
  statusLogs  ReportStatusLog[]

  @@index([status])
  @@index([userId])
}

enum ReportStatus {
  REPORTED
  VERIFIED
  IN_PROGRESS
  RESOLVED
}

// Append-only log — NEVER update an old record, always INSERT a new row.
model ReportStatusLog {
  id        String       @id @default(uuid())
  reportId  String
  report    Report       @relation(fields: [reportId], references: [id])
  officerId String?
  officer   Officer?     @relation(fields: [officerId], references: [id])
  status    ReportStatus
  notes     String?
  updatedAt DateTime     @default(now())

  @@index([reportId])
}

model Officer {
  id     String  @id @default(uuid())
  // Links this Officer profile to the User account used to log in (phone OTP, role = OFFICER).
  // Not in the original model summary — added because ReportStatusLog.officerId otherwise had
  // no way to resolve which Officer record corresponds to the logged-in User.
  userId String? @unique
  user   User?   @relation(fields: [userId], references: [id])

  name       String
  department String
  area       String
  statusLogs ReportStatusLog[]
}

model Badge {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  badgeType String
  earnedAt  DateTime @default(now())

  @@index([userId])
}
```

**Append-only principle for `ReportStatusLog`**: every status change = INSERT a new row, never UPDATE. The `status` field on `Report` is kept in sync with the latest status for fast queries, but the full history always lives in `ReportStatusLog`. This pattern is consistent with what's typically used in large-scale monitoring systems — prioritize the audit trail over simplicity. `app/api/reports/[id]/status/route.ts` does the insert-then-sync inside one `$transaction`.

**Prisma version pin**: `package.json` pins `prisma`/`@prisma/client` to `^6.0.0`, not `latest`. Prisma 7 removed `datasource { url / directUrl }` from `schema.prisma` in favor of a separate `prisma.config.ts` + driver-adapter setup — a bigger paradigm shift than this project needs. Re-evaluate the move to 7 as a deliberate step later, not as a side effect of a routine `npm update`.

**`datasource` needs two URLs** (Supabase-specific): `url` is the pooled pgbouncer connection (port 6543) the app queries through at runtime; `directUrl` is the unpooled connection (port 5432) Prisma Migrate needs, since migrations can't run over pgbouncer's transaction pooling mode. Both are documented in `.env.example`.

**Route protection**: role-based access lives in `proxy.ts` at the project root (Next.js renamed the `middleware.ts` convention to `proxy.ts` — same behavior, `export async function proxy(...)` instead of `middleware(...)`). It re-checks the session in each `(citizen)/(officer)/(admin)` route group's own `layout.tsx` too, since middleware/proxy alone doesn't narrow the `session` type for the page below it.

## AI integration points (Gemini API)

1. **`POST /api/ai/recommend`** — takes the latest `EnergyLog` data + history, returns an energy-saving recommendation in natural, non-generic language.
2. **`POST /api/ai/summarize`** — takes a set of `Report`s in one category/area, returns a summary of recurring issue patterns for the admin dashboard. Can also be used to auto-categorize a new report based on its free-text description.

Mandatory rules:
- The Gemini API key lives ONLY in a server-side environment variable (`GEMINI_API_KEY`), never sent to the client.
- Always validate & sanitize input before sending it to the AI (guard against prompt injection via citizen-submitted report descriptions).
- Handle free-tier rate limits with a graceful fallback (show "recommendation not yet available" instead of a raw error to the user).

## Coding conventions

- TypeScript strict mode enabled, avoid `any`.
- All components are server-first (Server Components) except where interactivity is needed (forms, maps, charts) — add `'use client'` only where necessary.
- Validate API route input with Zod.
- All endpoints that accept citizen-submitted data (reports, energy logs) must have basic rate limiting to prevent spam.
- Naming: `PascalCase` for components, `camelCase` for functions/variables, `kebab-case` for Next.js route folders.

## Competition constraints that must not be violated when generating code

- **No instant website builders** (WordPress, Wix, etc.) — the project must be built from code (frameworks/libraries are allowed, which is already satisfied by using Next.js).
- The work must be **original** — no copy-pasting an already-published commercial template.
- AI usage must be **responsible**: no copyright infringement, must include user data protection & basic security (input validation, no unprotected storage of sensitive data).
- README.md must cover the 5 required sections per the organizer's rules: app explanation, tech stack, key features, installation, usage (already present in `README.md` — update it as new features are added).

## Progress checklist (update manually as work progresses)

- [x] Set up Next.js + Prisma + database project — scaffolded, builds/typechecks/lints clean (no live DB connected yet)
- [x] OTP auth (citizen/officer/admin login) — one stateless OTP flow for all three roles; officer/admin accounts provisioned via `prisma/seed.ts`
- [x] Energy module: data input, trend dashboard, AI recommendation integration
- [x] Report module: report form, photo upload, location map
- [x] Officer verification & status update flow
- [x] Admin dashboard: aggregate data, data map, AI summaries
- [ ] Realtime notifications — not started (Report/ReportStatusLog writes are in place; no Supabase Realtime subscription wired up on the client yet)
- [ ] Responsive check (mobile/tablet/desktop) — Tailwind responsive classes used throughout, but not yet visually verified in a real browser at each breakpoint
- [ ] Deploy to Vercel — not deployed yet; see the deployment steps below once a Supabase project exists
- [ ] Finalize README & documentation — README/ARCHITECTURE updated for the current structure; `Team` section still has placeholders, no screenshots yet

# EcoLur — Smart Sustainable Digital Solution for Inclusive Society

> An integrated digital platform for household/SME energy monitoring and public service reporting, powered by AI-driven recommendations.

Developed as a **Web Development Platform for Community Sustainability**
Sub-theme: *Smart Sustainable Digital Solution for Inclusive Society*
SDGs implemented: **SDG 7**, **SDG 9**, **SDG 11**

---

## Table of Contents

- [Background & Purpose](#background--purpose)
- [SDGs Implemented](#sdgs-implemented)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Technical Documentation](#architecture--technical-documentation)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [AI Usage in Development](#ai-usage-in-development)
- [Team](#team)
- [Links](#links)
- [License](#license)

---

## Background & Purpose

Many cities and districts in Indonesia face two problems that are rarely solved together:

1. **Household/SME energy consumption goes unmonitored** — residents lack visibility into their electricity usage patterns, making it hard to take concrete energy-saving action.
2. **Public service issues are reported manually and slowly** — infrastructure reports (broken roads, garbage, drainage) are often untracked, leaving residents unsure whether their report was ever followed up.

**EcoLur** brings both into one platform: residents can monitor their energy footprint and report/track city infrastructure issues, while local government gets a real-time, data-driven transparency dashboard for decision-making.

The name **EcoLur** combines *"Eco"* (sustainability) with *"Lur"* — taken from **Bojong Kulur**, the pilot area for this project in **Gunung Putri, Kabupaten Bogor**, and also a familiar, friendly term of address in local slang. The platform is designed to start in one kelurahan but scale to any city or district in Indonesia facing the same energy and public service challenges.

Goals of the application:
- Encourage energy-saving awareness through clear, actionable data.
- Speed up and add transparency to the public issue reporting process.
- Provide aggregate data local government can use for better city planning.

---

## SDGs Implemented

| SDG | Implementation in EcoLur |
|---|---|
| **SDG 7** — Affordable and Clean Energy | Household/SME energy consumption monitoring, cost and carbon emission estimates, AI-driven energy-saving recommendations, energy-saving gamification. |
| **SDG 9** — Industry, Innovation, and Infrastructure | Modern web-based digital system for managing city data, append-only log architecture for audit trails, AI integrated as a service innovation. |
| **SDG 11** — Sustainable Cities and Communities | Public service reporting module with real-time status tracking, transparency dashboard for local government, map view of reports and energy data. |

---

## Key Features

### Energy Module (SDG 7)
- Track electricity consumption per period
- Consumption trend visualization, cost and carbon emission estimates
- Automatic AI-generated energy-saving recommendations (Gemini API)
- Gamification: energy-saving score and achievement badges

### Public Service Module (SDG 11)
- Report public issues with photo and location pin
- Real-time status tracking (*Reported → Verified → In Progress → Resolved*)
- Automatic notifications to the reporter when status changes
- AI-powered automatic report categorization

### Transparency Dashboard (Local Gov/Admin)
- Aggregate energy and report statistics per area
- Map view of data distribution (Leaflet + OpenStreetMap)
- AI-generated summaries of recurring issue patterns
- Report data export

**Differentiator**: combining two everyday citizen concerns (energy and public services) into one platform, backed by an append-only log architecture for a full audit trail, with AI integrated not as a bolt-on chatbot but at real decision points (energy recommendations & report classification).

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Core framework | **Next.js 14+ (App Router) + TypeScript** | Fullstack — frontend and API routes in one app, simplifying deployment to Vercel |
| Styling | **Tailwind CSS** | Responsive, consistent styling across screen sizes |
| Database | **PostgreSQL** (via Neon/Supabase free tier) | Core data storage (users, reports, energy logs) |
| ORM | **Prisma** | Type-safe database queries and migrations |
| Authentication | **Phone number-based OTP** | Passwordless login, matching common Indonesian user habits |
| Maps | **Leaflet.js + OpenStreetMap** | Report location visualization without a paid API key |
| Charts | **Recharts** | Energy trend and dashboard statistics visualization |
| AI | **Google Gemini API** (free tier) | Energy-saving recommendations & report summarization/classification |
| Realtime | **Supabase Realtime / Pusher** (free tier) | Report status notifications without page refresh |
| Hosting | **Vercel** | Free hosting for frontend + API routes |

---

## Architecture & Technical Documentation

Full system architecture, per-actor use case diagrams, ERD, and report status flow are documented in [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Installation

### Prerequisites
- Node.js v18 or newer
- npm or pnpm
- A free PostgreSQL database (recommended: [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- A Google Gemini API key (free via [Google AI Studio](https://aistudio.google.com))

### Setup steps

```bash
# 1. Clone the repository
git clone https://github.com/<username>/ecolur.git
cd ecolur

# 2. Install dependencies
npm install

# 3. Copy the environment variable template
cp .env.example .env

# 4. Fill in .env with your own credentials
# DATABASE_URL, GEMINI_API_KEY, etc. (see .env.example)

# 5. Run database migrations
npx prisma migrate dev

# 6. (Optional) Seed sample data
npx prisma db seed

# 7. Start the development server
npm run dev
```

The app will be running at `http://localhost:3000`

---

## Usage

```bash
# Log in as a citizen (demo account after seeding)
Phone number: 081234567890
Demo OTP (development mode): 000000

# Build for production
npm run build
npm run start

# Open Prisma Studio to inspect the database
npx prisma studio
```

Basic usage flow:
1. A citizen logs in via OTP → inputs energy consumption data or files a public issue report.
2. A local officer logs in → verifies incoming reports → updates their status.
3. A local government admin logs in → monitors the aggregate dashboard and data map.

---

## Project Structure

```
ecolur/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login & OTP pages (no navbar layout)
│   ├── (citizen)/                # Citizen: energy, report, my-reports (own layout + navbar)
│   ├── (officer)/                # Officer: incoming-reports (own layout + navbar)
│   ├── (admin)/                  # Admin: dashboard (own layout + navbar)
│   └── api/                      # Route handlers — auth, energy-logs, reports, ai/*
├── components/
│   ├── ui/                       # Button, Card, Input/Textarea/Label, StatusBadge
│   ├── layout/                   # Role-aware Navbar
│   ├── auth/                     # OtpForm
│   ├── energy/                   # EnergyForm, EnergyChart, RecommendationCard
│   ├── reports/                  # ReportForm, LocationPicker, StatusTimeline, StatusUpdateForm
│   └── admin/                    # ReportsMap(+loader), AiSummaryPanel, ExportCsvButton
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── session.ts                # Edge-safe: signed session cookie + stateless OTP challenge
│   ├── auth.ts                   # Node-only: DB-touching auth helpers, re-exports session.ts
│   ├── ai.ts                     # Gemini API wrapper (recommend / summarize / classify)
│   ├── supabase.ts               # Server-side Storage upload (report photos)
│   ├── validations.ts            # Zod schemas for every API route
│   ├── rate-limit.ts             # In-memory rate limiter
│   ├── energy-calc.ts            # Server-side cost/CO2 estimate from raw kWh
│   ├── actions.ts                # Server Actions (logout)
│   └── utils.ts                  # cn(), formatRupiah(), statusLabel()
├── prisma/
│   ├── schema.prisma             # Database schema (see ARCHITECTURE.md)
│   └── seed.ts                   # Demo citizen/officer/admin + sample data
├── public/                       # Static assets
├── proxy.ts                      # Route protection + role-based access (Next.js 16 "proxy" convention)
├── ARCHITECTURE.md               # Full architecture, use cases, ERD
├── CLAUDE.md                     # Project context for AI coding assistant
├── .env.example
└── package.json
```

---

## AI Usage in Development

In line with competition rule #7, here is a transparent disclosure of how AI is used in this project:

- **AI as a product feature**: Google Gemini API is used to generate energy-saving recommendations and to summarize/classify public issue reports. Only relevant data is sent to the AI (no sensitive personal data such as full phone numbers).
- **AI as a development aid**: part of the codebase was developed with the help of an AI coding assistant (Claude), but all architecture decisions, technical choices, and final output have been reviewed and are fully understood by the team.
- **Ethical commitment**: the team takes full responsibility for all generated code and content, ensuring no copyright infringement, protecting user data privacy (OTP authentication, no unencrypted storage of sensitive data), and performing basic security validation (input sanitization, rate limiting on public endpoints).

---

## Team

| Name | Student ID | University | Role |
|---|---|---|---|
| [Member 1 Name] | [Student ID] | [University] | [Fullstack Developer] |
| [Member 2 Name] | [Student ID] | [University] | [UI/UX Designer] |
| [Member 3 Name] | [Student ID] | [University] | [Backend Developer] |

---

## Links

- GitHub Repository: `[fill in repo link]`
- Live demo (hosting): `[fill in Vercel/Netlify link]`
- Pitch deck: `[fill in after advancing to the final round]`

---

## License
 
This project is original work — not previously published for commercial use nor a winner of any similar prior competition.

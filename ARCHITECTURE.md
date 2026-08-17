# EcoLur Architecture

This document contains the system architecture, per-actor use cases, database schema (ERD), and the report status flow in full — nothing is left implicit in prose only.

---

## 1. System Architecture

```mermaid
graph TD
  Client["Client Web App<br/>Next.js + TypeScript"]
  Auth["Auth / OTP Service<br/>Phone number verification"]
  API["Backend API<br/>Next.js API Routes"]
  DB[("PostgreSQL<br/>Core data")]
  AI["Gemini AI API<br/>Recommendations & summaries"]
  Maps["Leaflet + OpenStreetMap<br/>Geolocation"]
  RT["Realtime Notification<br/>Supabase Realtime / Pusher"]

  Client --> Auth
  Client --> API
  API --> DB
  API --> AI
  API --> Maps
  Auth --> RT
  RT -.status notification.-> Client
```

Notes:
- **Auth/OTP** and **Backend API** are logically separated even though they run within a single Next.js deployment (different API routes).
- **Realtime Notification** pushes updates to the client every time `ReportStatusLog` gets a new row.
- **Gemini AI API** is called from the server (API routes), never directly from the browser.

---

## 2. Use Cases per Actor

### Actor: Citizen

| # | Use case | Description |
|---|---|---|
| 1 | Log in via OTP | Passwordless authentication using phone number |
| 2 | Input energy consumption | Enter monthly electricity usage data |
| 3 | View energy-saving recommendations | Automatic insight from Gemini API based on consumption history |
| 4 | View score & energy-saving badges | Gamification based on consumption reduction |
| 5 | Report a public issue | Submit a report with photo & location pin |
| 6 | Track report status | View the status history of one's own reports |
| 7 | Receive report status notifications | Realtime notification when status changes |
| 8 | View the city transparency dashboard | Public aggregate statistics (no personal data) |

### Actor: Local Officer

| # | Use case | Description |
|---|---|---|
| 1 | Log in | Authentication specific to officer accounts |
| 2 | View incoming reports by area | Filter reports by assigned area |
| 3 | Verify report | Determine whether a report is valid before processing |
| 4 | Update report status | Change status to In Progress/Resolved (inserts a new log row) |
| 5 | Add follow-up notes | Internal notes related to handling the report |

### Actor: Local Government / Admin

| # | Use case | Description |
|---|---|---|
| 1 | Log in | Authentication specific to admin accounts |
| 2 | View aggregate SDG dashboard | Energy & report statistics as SDG impact indicators |
| 3 | View data distribution map | Geographic visualization of reports & energy consumption |
| 4 | Export report data | Download data for further reporting/analysis |
| 5 | Manage officer accounts | Add/deactivate local officer accounts |

---

## 3. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
  USERS ||--o{ ENERGY_LOGS : records
  USERS ||--o{ REPORTS : submits
  USERS ||--o{ BADGES : earns
  REPORTS ||--o{ REPORT_STATUS_LOGS : has
  OFFICERS ||--o{ REPORT_STATUS_LOGS : updates

  USERS {
    uuid id PK
    string name
    string phone
    string role
    string rt_rw
    timestamp created_at
  }
  ENERGY_LOGS {
    uuid id PK
    uuid user_id FK
    string period
    float consumption_kwh
    float cost_estimate
    float co2_estimate
  }
  REPORTS {
    uuid id PK
    uuid user_id FK
    string category
    string description
    float lat
    float lng
    string status
    timestamp created_at
  }
  REPORT_STATUS_LOGS {
    uuid id PK
    uuid report_id FK
    uuid officer_id FK
    string status
    string notes
    timestamp updated_at
  }
  OFFICERS {
    uuid id PK
    string name
    string department
    string area
  }
  BADGES {
    uuid id PK
    uuid user_id FK
    string badge_type
    timestamp earned_at
  }
```

**Design principle**: `REPORT_STATUS_LOGS` is append-only — every status change becomes a new row rather than overwriting the previous one. This guarantees a complete audit trail for transparency to local government and judges.

---

## 4. Report Status Flow

```mermaid
sequenceDiagram
  participant W as Citizen
  participant S as System
  participant O as Officer
  participant N as Realtime Notification

  W->>S: Submit report (photo + location)
  S->>S: Status: Reported
  O->>S: Verify report
  S->>S: Status: Verified
  S->>N: Trigger notification
  N->>W: Status change notification
  O->>S: Update status
  S->>S: Status: In Progress
  S->>N: Trigger notification
  N->>W: Status change notification
  O->>S: Update status
  S->>S: Status: Resolved
  S->>N: Trigger notification
  N->>W: Status change notification
```

Every status transition creates a new row in `REPORT_STATUS_LOGS` and triggers a realtime notification to the reporting citizen.

---

## 5. AI Integration Points

| Feature | Endpoint | Input | Output |
|---|---|---|---|
| Energy-saving recommendation | `POST /api/ai/recommend` | Citizen's `EnergyLog` history | Recommendation text in natural language |
| Report summary & classification | `POST /api/ai/summarize` | A set of `Report`s per area/category | Issue pattern summary + automatic category |

Model used: **Google Gemini API (Flash/Flash-Lite, free tier)**, called from server-side API routes.

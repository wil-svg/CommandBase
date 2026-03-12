# Cochrane Realty — 1099 Task Manager

## Project Overview

A task management system for delegating marketing work to 1099 contractors. Two separate interfaces:

1. **Admin Dashboard** (`/admin`) — Wil creates worker profiles, assigns tasks, tracks time/costs
2. **Worker Mobile App** (`/worker`) — Contractors log in, see assigned tasks, start/stop timers, mark complete

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel KV (Redis) — free tier, zero config on Vercel
- **Hosting**: Vercel (deployed from GitHub)
- **Auth**: Simple PIN-based login (no OAuth complexity needed)
- **Styling**: Tailwind CSS
- **No external UI libraries** — keep it lean

### Design Aesthetic

- Warm sand background: `#F5F3ED`
- Clean, minimal, professional — not generic SaaS
- Font: `DM Sans` from Google Fonts
- Monospace numbers: `JetBrains Mono`
- Color palette matches the Cochrane Realty marketing machine:
  - Purple (primary/admin): `#534AB7` / `#EEEDFE`
  - Blue: `#185FA5` / `#E6F1FB`
  - Teal: `#0F6E56` / `#E1F5EE`
  - Coral: `#993C1D` / `#FAECE7`
  - Pink: `#993556` / `#FBEAF0`
  - Amber: `#854F0B` / `#FAEEDA`
- Mobile-first design for the worker app
- Cards with subtle shadows, rounded corners (`border-radius: 10px`)

---

## Data Models

### Worker
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "pin": "string (4-6 digit login PIN, stored hashed)",
  "hourlyRate": "number (dollars per hour)",
  "status": "active | inactive",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### Task
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string (optional, longer details)",
  "category": "string (one of: Online, Print, Current Business, Sphere, Cold Outreach)",
  "subcategory": "string (optional — e.g. 'Online ads', 'Mailers', 'Referrals')",
  "priority": "low | medium | high | urgent",
  "dueDate": "ISO date (optional)",
  "assignedTo": "worker ID",
  "status": "pending | in_progress | completed | cancelled",
  "createdAt": "ISO datetime",
  "createdBy": "admin",
  "startedAt": "ISO datetime | null (when worker clicks Start)",
  "completedAt": "ISO datetime | null (when worker clicks Complete)",
  "timeSpentMinutes": "number (calculated from startedAt to completedAt)",
  "cost": "number (calculated: timeSpentMinutes / 60 * worker.hourlyRate)",
  "notes": "string (optional, worker can add notes on completion)"
}
```

### Category Reference (for task creation dropdowns)
```
Online → Website, Online ads, Social presence, SEO
Print → Listing signs, Marketing signs, Sponsors, Local paper, Mailers, Door hangers
Current Business → Listing marketing, Rentals
Sphere → Friends & family, Referrals, Repeat customers, Events
Cold Outreach → Email campaigns, Cold calls
```

---

## API Routes

All routes under `/api/`. Use Vercel KV for storage.

### Auth
- `POST /api/auth/admin` — Admin login (single hardcoded admin PIN, stored in env var `ADMIN_PIN`)
- `POST /api/auth/worker` — Worker login by PIN, returns worker profile
- Auth is session-based using a simple token stored in a cookie. No JWT complexity needed.

### Workers
- `GET /api/workers` — List all workers (admin only)
- `POST /api/workers` — Create worker (admin only)
- `PUT /api/workers/[id]` — Update worker (admin only)
- `DELETE /api/workers/[id]` — Deactivate worker (admin only, soft delete via status change)
- `GET /api/workers/[id]/stats` — Get worker stats (tasks completed, hours worked this month, total year, total cost)

### Tasks
- `GET /api/tasks` — List tasks (admin: all tasks; worker: only their assigned tasks)
- `POST /api/tasks` — Create task (admin only)
- `PUT /api/tasks/[id]` — Update task (admin: any field; worker: only status, startedAt, completedAt, notes)
- `DELETE /api/tasks/[id]` — Delete task (admin only)
- `POST /api/tasks/[id]/start` — Worker starts task (sets startedAt, status to in_progress)
- `POST /api/tasks/[id]/complete` — Worker completes task (sets completedAt, calculates timeSpentMinutes and cost, status to completed)

---

## Admin Dashboard (`/admin`)

### Admin Login Page (`/admin/login`)
- Simple PIN entry field
- PIN is checked against `ADMIN_PIN` environment variable
- On success, set an auth cookie and redirect to `/admin`

### Admin Main Dashboard (`/admin`)
- **Header**: "Cochrane Realty — Task Manager" with navigation tabs
- **Summary cards** at the top:
  - Total active tasks
  - Tasks completed this month
  - Total hours this month
  - Total cost this month
- **Recent activity feed** — latest task completions with worker name, task, time, cost

### Worker Management (`/admin/workers`)
- **List of all workers** with: name, hourly rate, status (active/inactive), tasks completed count, hours this month
- **"Add Worker" button** → modal/form with: name, email, phone, hourly rate, PIN (auto-generate or manual entry)
- **Click a worker** → detail view with:
  - Profile info (editable)
  - Stats panel:
    - Tasks completed this month / this year
    - Hours worked this month / this year
    - Total cost this month / this year
  - Task history table: all tasks assigned to this worker with status, time, cost

### Task Management (`/admin/tasks`)
- **Task list** with filters:
  - Filter by status (pending, in progress, completed, all)
  - Filter by worker
  - Filter by category
  - Filter by priority
- **"Create Task" button** → form with:
  - Title (required)
  - Description (optional textarea)
  - Category dropdown (Online, Print, Current Business, Sphere, Cold Outreach)
  - Subcategory dropdown (dynamically populated based on category selection)
  - Priority (low, medium, high, urgent)
  - Due date (date picker, optional)
  - Assign to worker (dropdown of active workers)
- **Task cards** show: title, category badge (color-coded), priority badge, assigned worker, status, time spent if completed, cost if completed
- Click a task → detail view with full info and ability to edit or cancel

---

## Worker Mobile App (`/worker`)

This must be optimized for mobile — touch-friendly, large buttons, clear typography.

### Worker Login Page (`/worker/login`)
- Large PIN entry pad (like a phone lock screen)
- Numeric keypad with big touch targets
- On success, redirect to `/worker`

### Worker Task Dashboard (`/worker`)
- **Header**: Worker's name, "My Tasks"
- **Tab navigation**: Active | Completed
- **Active tab** shows pending and in-progress tasks, sorted by:
  1. In-progress first (with running timer visible)
  2. Then by priority (urgent → high → medium → low)
  3. Then by due date (soonest first)

### Task Card (worker view)
Each task card shows:
- Title
- Category + subcategory (color-coded badge)
- Priority badge
- Due date (if set), with visual warning if overdue or due today
- Description (expandable)

**Task states and actions:**

1. **Pending** → Shows "Start" button (large, prominent)
2. **In Progress** → Shows:
   - Live running timer (MM:SS or HH:MM:SS format, updating every second)
   - "Complete" button (large, green)
   - Optional: "Add Note" text field
3. **Completed** → Shows:
   - Time spent
   - Completion timestamp
   - Any notes added

### Worker clicking "Start":
- Sets `startedAt` to current timestamp
- Changes status to `in_progress`
- Timer begins counting up on screen
- Only ONE task can be in progress at a time — if worker tries to start a second task, prompt them to complete or pause the current one

### Worker clicking "Complete":
- Sets `completedAt` to current timestamp
- Calculates `timeSpentMinutes` from the difference
- Calculates `cost` based on worker's hourly rate
- Optional: prompt for notes before completing
- Changes status to `completed`
- Shows a confirmation with time and earnings summary

---

## Vercel KV Data Structure

Use Redis-style key patterns:

```
worker:{id}              → Worker JSON object
workers:index            → Set of all worker IDs
task:{id}                → Task JSON object
tasks:index              → Set of all task IDs
tasks:worker:{workerId}  → Set of task IDs assigned to a worker
tasks:status:{status}    → Set of task IDs by status
session:{token}          → Session data (role + worker ID if applicable)
```

---

## Environment Variables (Vercel)

```
ADMIN_PIN=______          # Admin login PIN (e.g. "1234" for dev, something stronger for prod)
KV_REST_API_URL=______    # Auto-populated when you connect Vercel KV
KV_REST_API_TOKEN=______  # Auto-populated when you connect Vercel KV
```

---

## Setup Instructions (for Wil)

### 1. Create the GitHub repo
```bash
# Create a new repo on GitHub called "cochrane-task-manager"
# Clone it locally (or use GitHub web editor)
# Copy all project files into it
# Push to GitHub
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Import Project" and select the `cochrane-task-manager` repo
3. Vercel auto-detects Next.js — just click Deploy
4. After deploy, go to the project's Storage tab
5. Click "Create Database" → select "KV" → create it (free tier)
6. This auto-populates the KV environment variables
7. Add `ADMIN_PIN` to the Environment Variables section (Settings → Environment Variables)
8. Redeploy

### 3. Access
- Admin: `https://your-app.vercel.app/admin`
- Worker: `https://your-app.vercel.app/worker` (share this URL with contractors — they can add it to their phone home screen as a PWA)

---

## File Structure

```
cochrane-task-manager/
├── app/
│   ├── layout.tsx                 # Root layout with fonts
│   ├── page.tsx                   # Landing redirect
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout with nav
│   │   ├── login/page.tsx         # Admin PIN login
│   │   ├── page.tsx               # Admin dashboard
│   │   ├── workers/
│   │   │   ├── page.tsx           # Worker list
│   │   │   └── [id]/page.tsx      # Worker detail/stats
│   │   └── tasks/
│   │       ├── page.tsx           # Task list with filters
│   │       └── [id]/page.tsx      # Task detail
│   ├── worker/
│   │   ├── layout.tsx             # Mobile-optimized layout
│   │   ├── login/page.tsx         # PIN pad login
│   │   └── page.tsx               # Worker task dashboard
│   └── api/
│       ├── auth/
│       │   ├── admin/route.ts
│       │   └── worker/route.ts
│       ├── workers/
│       │   ├── route.ts           # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts       # GET, PUT, DELETE
│       │       └── stats/route.ts # GET stats
│       └── tasks/
│           ├── route.ts           # GET list, POST create
│           └── [id]/
│               ├── route.ts       # GET, PUT, DELETE
│               ├── start/route.ts # POST start timer
│               └── complete/route.ts # POST complete
├── components/
│   ├── admin/
│   │   ├── TaskCard.tsx
│   │   ├── WorkerCard.tsx
│   │   ├── CreateTaskModal.tsx
│   │   ├── CreateWorkerModal.tsx
│   │   ├── StatsCards.tsx
│   │   └── FilterBar.tsx
│   ├── worker/
│   │   ├── TaskCard.tsx
│   │   ├── PinPad.tsx
│   │   ├── Timer.tsx
│   │   └── CompleteModal.tsx
│   └── shared/
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Modal.tsx
├── lib/
│   ├── kv.ts                     # Vercel KV helper functions
│   ├── auth.ts                   # Auth helpers (cookie management)
│   ├── categories.ts             # Marketing categories/subcategories data
│   └── utils.ts                  # Formatting, time calculations
├── public/
│   └── manifest.json             # PWA manifest for mobile home screen
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Important Implementation Notes

1. **Timer accuracy**: The running timer on the worker's screen is cosmetic (client-side JS). The actual time calculation uses server-side `startedAt` and `completedAt` timestamps — no cheating the clock.

2. **One active task at a time**: Worker can only have one task in `in_progress` status. Enforce this server-side on the `/api/tasks/[id]/start` route.

3. **Cost calculation**: Always calculated server-side as `(timeSpentMinutes / 60) * worker.hourlyRate`. Never trust client-sent cost values.

4. **PWA support**: Include a `manifest.json` so workers can "Add to Home Screen" on their phones and it feels like a native app. Include appropriate meta tags for iOS standalone mode.

5. **Category colors** should match the marketing machine diagram:
   - Online → Blue (`#185FA5` / `#E6F1FB`)
   - Print → Teal (`#0F6E56` / `#E1F5EE`)
   - Current Business → Coral (`#993C1D` / `#FAECE7`)
   - Sphere → Pink (`#993556` / `#FBEAF0`)
   - Cold Outreach → Amber (`#854F0B` / `#FAEEDA`)

6. **Time display formatting**:
   - Running timer: `HH:MM:SS`
   - Completed time: `Xh Ym` (e.g., "2h 15m")
   - Cost: `$XX.XX`

7. **Stats calculations**:
   - "This month" = current calendar month
   - "This year" = current calendar year
   - Hours = sum of `timeSpentMinutes / 60` for completed tasks in period
   - Cost = sum of `cost` for completed tasks in period

8. **Mobile optimization for worker app**:
   - Minimum touch target: 44px
   - Large text for timer display
   - Swipe-friendly card layout
   - No tiny buttons or links
   - Works well on iPhone SE through iPhone 15 Pro Max

9. **Admin PIN**: For v1, just a single PIN in an environment variable. No username. Simple.

10. **Worker PIN**: Each worker gets a unique 4-6 digit PIN set by admin. Stored hashed with bcrypt. Worker enters PIN on the phone keypad UI to log in.

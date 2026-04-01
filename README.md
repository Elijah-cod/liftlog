# LiftLog MVP

LiftLog is a mobile-first web MVP focused strictly on daily workout execution and logging.

## What is included

- `Today` page with the scheduled workout entry point
- Workout preview page with seeded exercise data
- Active workout logging with notes, custom sets, rest timers, autosaved local draft recovery, and optimistic syncing
- Completed or partial workout summary page
- Supabase-ready schema and RLS migration files
- Seeded mock repository so the app runs immediately before a real Supabase project is configured

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/today](http://localhost:3000/today).

## Scripts

```bash
npm run lint
npm run typecheck
npm run test
```

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Add your Supabase URL and publishable key.
3. Apply the SQL in [supabase/migrations/20260401130000_create_workout_logging.sql](/Users/elijah/Documents/Projects/liftlog/supabase/migrations/20260401130000_create_workout_logging.sql).
4. Update and run [supabase/seed.sql](/Users/elijah/Documents/Projects/liftlog/supabase/seed.sql) with a real `auth.users` UUID.

Until those values exist, the app runs in seeded mock mode so the workout execution UI remains testable.

## Recommended commit sequence

- `chore: bootstrap next.js app shell and core developer tooling`
- `feat: add auth and postgres schema for workout execution logging`
- `feat: seed workout templates exercises and daily schedule data`
- `feat: build today and workout preview flows`
- `feat: create active session lifecycle and autosaved draft store`
- `feat: implement exercise cards set logging and superset layout`
- `feat: support notes custom sets and rest timers`
- `feat: add completed workout summary and partial workout handling`
- `test: cover workout execution flows and failure recovery`
- `chore: harden production deployment env validation and error monitoring`

## Deployment notes

- Use Vercel for the Next.js app and Supabase for Postgres/Auth.
- Keep the mock repository for local demos only.
- Replace the seeded placeholder media once real exercise assets are available.

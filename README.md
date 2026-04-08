# LiftLog MVP

LiftLog is a mobile-first web MVP focused strictly on daily workout execution and logging.

## What is included

- `Today` page with the scheduled workout entry point
- Workout preview page with seeded exercise data
- Active workout logging with notes, custom sets, rest timers, autosaved local draft recovery, and optimistic syncing
- Completed or partial workout summary page
- Supabase-ready schema and RLS migration files
- Seeded mock repository so the app runs immediately before a real Supabase project is configured

## Runtime requirements

- Node.js `20.9+`
- `.nvmrc` is included and currently pins `20.18.0`
- `npm` for package install and scripts

If you see Next.js complain about Node 18 during `typecheck` or `build`, switch runtimes first:

```bash
nvm use || nvm install
```

## Getting Started

Install dependencies and run the development server:

```bash
nvm use || nvm install
npm install
npm run dev
```

Open [http://localhost:3000/today](http://localhost:3000/today).

For a guided live-mode checklist inside the app, open `/setup`.

## Scripts

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run typecheck` and `npm run build` both require the supported Node runtime above because this app uses Next.js 16.

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Add your Supabase URL, publishable key, and app URL.
3. Add `SUPABASE_SERVICE_ROLE_KEY` if you want one-click live bootstrap from `/setup`.
4. Apply the SQL in [20260401130000_create_workout_logging.sql](/Users/elijah/Documents/Projects/liftlog/supabase/migrations/20260401130000_create_workout_logging.sql).
5. Update and run [seed.sql](/Users/elijah/Documents/Projects/liftlog/supabase/seed.sql) with a real `auth.users` UUID, or use `/setup` after login if the service role key is present.

If Supabase env vars are missing, or there is no authenticated Supabase user yet, the app falls back to seeded mock data so the workout execution UI remains testable while auth is still being built.

When env vars are present and the request has a valid Supabase session cookie, the repository switches to live Postgres reads and writes automatically.

## Auth flow

- Visit `/login` when Supabase is configured.
- Submit your email to receive a magic link.
- The callback route exchanges the auth code for a session and creates your `profiles` row automatically on first login.
- Authenticated app pages redirect unauthenticated users back to `/login`.

## Operability checks

- `GET /api/health` returns whether the app is in `mock`, `configured-no-session`, or `live` mode.
- `/setup` provides the in-app checklist for env vars, SQL setup, login, and smoke testing.
- If `SUPABASE_SERVICE_ROLE_KEY` is configured, `/setup` can seed the authenticated athlete directly from inside the app.
- `/setup` also includes a simple three-day schedule manager and a button to clear in-progress sessions for the authenticated athlete.

## Smoke test

1. Run `nvm use || nvm install`.
2. Run `npm install` and `npm run dev`.
3. Open `/today` and confirm mock mode works immediately.
4. Configure `.env.local`, then open `/login` and complete the magic-link flow.
5. Open `/setup`, seed live demo data, and assign today if needed.
6. Start a workout, log a few sets, reload, and confirm the local draft restores.
7. Finish the session and confirm it appears in `/history`.

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
- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_APP_URL` in your hosting provider before the first deploy.
- Add `SUPABASE_SERVICE_ROLE_KEY` only if you want the in-app bootstrap actions available in production.
- Point `NEXT_PUBLIC_APP_URL` at the final deployed URL so Supabase magic-link callbacks resolve correctly.
- Run the Supabase migration before the first live login, then seed demo data either with `supabase/seed.sql` or from `/setup`.
- After deployment, check `/api/health`, sign in, start a workout, log a few sets, reload once, and finish the session to verify the full path against your live project.
- Keep the mock repository for local demos only.
- Replace the seeded placeholder media once real exercise assets are available.

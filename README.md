# LiftLog

LiftLog is a mobile-first workout logging web app focused on one job: helping a single athlete open the day’s workout, log every set cleanly, recover safely from refreshes, and finish with a usable workout record.

The app is intentionally narrow. It does not try to be a full coaching platform, program builder, or analytics suite. The current scope is daily workout execution and review.

[Live demo](https://liftlog-six-iota.vercel.app) · [Repository](https://github.com/Elijah-cod/liftlog)

## What The App Does

- Shows today’s assigned workout
- Lets the athlete preview the session before starting
- Starts or resumes a workout session
- Logs weighted, bodyweight, and timed sets
- Supports supersets, notes, rest timers, and extra sets
- Autosaves progress with local draft recovery and sync retry feedback
- Finishes workouts as either `completed` or `partial`
- Shows workout summaries and recent history
- Lets the athlete schedule the same workout again from history or summary views

## Current Product Scope

Included:

- Daily workout entry point at `/today`
- Workout preview flow
- Active workout logging flow
- Completed and partial workout summary
- Recent workout history
- Minimal live setup and schedule management in `/setup`
- Magic-link auth with Supabase
- Supabase-ready schema, RLS, and seed data
- Mock fallback mode so the product runs before Supabase is configured

Out of scope:

- Program builder
- Coach / client roles
- Advanced progression logic
- PR detection logic
- Calendar planning UI beyond the lightweight setup tools
- Social features
- Full analytics dashboards

## Screens And Routes

- `/today`
  Main daily entry point. Shows the current scheduled workout or an empty state.
- `/workouts/[scheduledWorkoutId]`
  Workout preview before the session starts.
- `/sessions/[sessionId]`
  Active workout execution and logging.
- `/sessions/[sessionId]/complete`
  Read-only summary for completed or partial sessions.
- `/history`
  Recent session history with filters and repeat scheduling actions.
- `/setup`
  In-app environment, seeding, schedule, and smoke-test utilities.
- `/login`
  Magic-link sign-in for live mode.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- React 19
- Zustand for client workout-session state
- Supabase Auth + Postgres + SSR helpers
- Vitest for tests

## How The App Runs

LiftLog supports two runtime modes.

### 1. Mock Mode

Mock mode is the default developer-friendly path.

- No Supabase project is required
- The app uses seeded in-memory demo data
- You can open `/today` immediately after install and test the full workout flow

This is useful for UI work, interaction testing, and general local development.

### 2. Live Mode

Live mode activates when:

- `NEXT_PUBLIC_SUPABASE_URL` is set
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
- the request has a valid authenticated Supabase session

In live mode:

- Auth uses Supabase magic links
- Workout schedules, sessions, notes, and set logs are read and written from Postgres
- RLS protects user data
- `/setup` can seed and manage the authenticated athlete’s demo schedule

## Core User Flow

1. Open `/today`
2. Review the scheduled workout
3. Open the workout preview
4. Start or resume the session
5. Log sets, notes, extra sets, and rest
6. Let autosave keep local and server state in sync
7. Finish the workout
8. Review the summary
9. Revisit the session later in `/history`

## Key UX Behaviors

- Starting a workout creates a session snapshot from the scheduled template
- Previous performance is shown beside current logging inputs
- Supersets are grouped and labeled together
- Extra sets can be added and removed
- Drafts are restored after reload
- Failed autosaves surface retry UI
- Finishing is blocked while sync is still pending or failed
- Incomplete workouts can still be saved as `partial`

## Local Development

### Requirements

- Node.js `20.9+`
- `npm`

The repo includes `.nvmrc`. If your shell is using an older Node version:

```bash
nvm use || nvm install
```

### Install And Run

```bash
nvm use || nvm install
npm install
npm run dev
```

Open [http://localhost:3000/today](http://localhost:3000/today).

## Available Scripts

```bash
npm run dev
npm run lint
npm run test
npm run typecheck
npm run build
npm run start
```

Notes:

- `npm run typecheck` and `npm run build` require a supported Node version because this app uses Next.js 16.
- The build currently uses `next build --webpack`.

## Environment Variables

Copy `.env.example` to `.env.local`.

Required for live mode:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `SUPABASE_SERVICE_ROLE_KEY`
  Required only if you want one-click bootstrap actions from `/setup`

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill in the public Supabase values and your app URL.
4. Apply the SQL migration in [20260401130000_create_workout_logging.sql](/Users/elijah/Documents/Projects/liftlog/supabase/migrations/20260401130000_create_workout_logging.sql).
5. Seed data either by:
   - running [seed.sql](/Users/elijah/Documents/Projects/liftlog/supabase/seed.sql), or
   - signing in and using `/setup` if `SUPABASE_SERVICE_ROLE_KEY` is configured.

If live mode is not fully configured, the app automatically falls back to mock data instead of failing closed for local development.

## Auth

Live mode auth uses Supabase magic links.

- Visit `/login`
- Enter an email address
- Open the magic link
- The callback route exchanges the auth code for a session
- A `profiles` row is created automatically for first-time users

When live mode is configured, protected app pages redirect unauthenticated requests back to `/login`.

## Setup And Operability

The project includes lightweight in-app operational tooling at `/setup`.

It currently supports:

- environment/setup checklist
- live bootstrap for demo data
- simple schedule assignment for yesterday, today, and tomorrow
- clearing in-progress sessions
- smoke-test guidance

Health endpoint:

- `GET /api/health`
  Returns whether the app is currently running in `mock`, `configured-no-session`, or `live` mode.

## Recommended Smoke Test

### Mock Mode

1. Run the app locally
2. Open `/today`
3. Open a workout
4. Log a few sets
5. Reload the page
6. Confirm the draft restores
7. Finish the workout
8. Confirm it appears in `/history`

### Live Mode

1. Configure `.env.local`
2. Run the migration
3. Sign in through `/login`
4. Open `/setup`
5. Seed demo data
6. Assign today’s workout if needed
7. Start a workout
8. Log several changes
9. Reload once mid-session
10. Finish the workout
11. Confirm the result appears in `/history`
12. Check `/api/health`

## Project Structure

High-level layout:

- [src/app](/Users/elijah/Documents/Projects/liftlog/src/app)
  App Router pages, route handlers, and global app surfaces
- [src/components](/Users/elijah/Documents/Projects/liftlog/src/components)
  Shared UI components for workout flows
- [src/lib](/Users/elijah/Documents/Projects/liftlog/src/lib)
  Environment helpers, repositories, server logic, types, utilities, and store code
- [src/test](/Users/elijah/Documents/Projects/liftlog/src/test)
  Unit tests
- [supabase/migrations](/Users/elijah/Documents/Projects/liftlog/supabase/migrations)
  Database schema and RLS setup
- [supabase/seed.sql](/Users/elijah/Documents/Projects/liftlog/supabase/seed.sql)
  Seed data for a live Supabase project

## Deployment

Recommended production setup:

- Vercel for the Next.js app
- Supabase for Auth and Postgres

### Deployment Checklist

1. Create the Supabase project
2. Run the database migration
3. Configure hosting environment variables
4. Set `NEXT_PUBLIC_APP_URL` to the final deployed URL
5. Deploy the app
6. Complete one live smoke test

### Production Notes

- `robots.txt` currently disallows all crawling by default
- `poweredByHeader` is disabled
- basic security headers are set in `next.config.ts`
- global error and not-found pages are included
- mock mode is useful locally, but production should be treated as live-mode only

## What Still Needs Real-World Validation

The app is production-shaped, but the most important remaining validation is usage against a real Supabase project.

Recommended next checks after deployment:

- real magic-link delivery and callback behavior
- RLS behavior across authenticated users
- autosave behavior on slower networks
- mobile browser behavior on iPhone and Android
- any UI friction from longer real-world exercise names or notes

## Status

LiftLog is currently a focused MVP for daily workout execution and logging on the web. It is ready for continued refinement, live smoke testing, and deployment into a controlled single-athlete production environment.

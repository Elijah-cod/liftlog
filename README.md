# LiftLog

LiftLog is a mobile-first adaptive training app for self-coached lifters. It builds an equipment-aware workout plan from the athlete’s goals, schedule, experience, body inputs, and muscle priorities, then turns the training log into an exact next-session progression target.

The product keeps the clarity of a personal training journal while adding planning, substitutions, free exercise education, session adaptations, personal records, and useful progress views.

[Live demo](https://liftlog-six-iota.vercel.app) · [Repository](https://github.com/Elijah-cod/liftlog)

## Core Features

- Generates 2–6 day gym or home programs from goals, experience, available time, equipment, and body inputs
- Adds focused weekly volume for up to two lagging muscle groups
- Calculates exact next-session load and rep targets using double progression, reps in reserve, missed targets, and deload state
- Includes 270 tutorial-backed exercise entries with free MuscleWiki guides or focused YouTube destinations
- Finds equipment-compatible substitutions that preserve the trained muscle and movement pattern
- Logs warm-up, working, dropset, deload, rehab, cardio, bodyweight, timed, and extra work
- Shortens workouts to 30 or 45 minutes by preserving primary movements before trimming accessories
- Supports one-off session edits and permanent plan edits
- Autosaves progress with local draft recovery and sync retry feedback
- Shows exercise history, personal records, workout summaries, and recent history
- Lets the athlete schedule the same workout again from history or summary views
- Supports email/password account creation, password login, and magic-link sign-in
- Saves each authenticated athlete’s generated routine to a private, user-owned database row
- Provides an interactive demo whose changes remain isolated in the visitor’s browser

## Current Product Scope

Included:

- Daily workout entry point at `/today`
- Adaptive plan builder and Muscle Group Prioritizer at `/plan`
- Live adaptable workout tracker at `/train`
- Searchable free tutorial and substitution library at `/exercises`
- Progression lab, volume trend, personal records, and history at `/progress`
- Workout preview flow
- Active workout logging flow
- Completed and partial workout summary
- Recent workout history
- Minimal live setup and schedule management in `/setup`
- Email/password and magic-link auth with Supabase
- Supabase schema, row-level ownership policies, and seed data
- Interactive demo mode with browser-local data that never mixes with member records

Out of scope: coach/client roles, social features, medical diagnosis, and prescriptive injury rehabilitation.

## Screens And Routes

- `/today`
  Main daily entry point with today’s generated workout, recovery context, next progression, and shortener shortcuts.
- `/plan`
  Adaptive plan builder for schedule, goal, location, equipment, experience, body inputs, and muscle priorities.
- `/train`
  Flexible workout logger with set types, substitutions, special exercise additions, shortener, and edit scope.
- `/exercises`
  Searchable 270-entry tutorial and substitution library.
- `/progress`
  Progression lab, personal records, volume trend, and workout history.
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
  Account creation, password login, magic-link sign-in, and interactive demo entry.

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

### 1. Demo Mode

Demo mode is the developer-friendly and visitor-facing path.

- No Supabase project is required
- The app uses seeded demo data and browser-local routine changes
- Demo activity never reads or writes authenticated member records
- You can open `/today` immediately after install and test the full workout flow

This is useful for UI work, interaction testing, and general local development.

### 2. Live Mode

Live mode activates when:

- `NEXT_PUBLIC_SUPABASE_URL` is set
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
- the request has a valid authenticated Supabase session

In live mode:

- Auth supports email/password accounts and Supabase magic links
- Generated training profiles and routines are persisted per user
- Workout schedules, sessions, notes, and set logs are read and written from Postgres
- RLS requires `auth.uid()` to match the owner on every user-data table
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
4. Apply the SQL migrations in order:
   - [20260713174229_create_workout_logging.sql](/Users/elijah/Documents/Projects/liftlog/supabase/migrations/20260713174229_create_workout_logging.sql)
   - [20260713174238_add_private_training_plans.sql](/Users/elijah/Documents/Projects/liftlog/supabase/migrations/20260713174238_add_private_training_plans.sql)
5. Seed data either by:
   - running [seed.sql](/Users/elijah/Documents/Projects/liftlog/supabase/seed.sql), or
   - signing in and using `/setup` if `SUPABASE_SERVICE_ROLE_KEY` is configured.

If live mode is not fully configured, the app automatically falls back to mock data instead of failing closed for local development.

## Accounts, Privacy, And Demo Access

Live mode auth uses Supabase email/password accounts with in-app email-code verification.

- Visit `/login`
- Create an account with a name, email, and password, or sign in to an existing account
- Passwords require at least eight characters with both a letter and a number
- New accounts enter a six-digit email code in LiftLog instead of opening a confirmation link
- Existing accounts can request a six-digit sign-in code instead of using a password
- Pending email addresses are stored in a short-lived HttpOnly cookie, not exposed in the URL
- Resends and expired-code recovery stay on the verification screen
- A `profiles` row is created automatically for first-time users
- The plan builder stores the validated profile and generated routine under the authenticated user ID
- Postgres RLS independently enforces ownership even if a client attempts to query another user ID
- Demo access uses an HttpOnly mode cookie and browser-local routine data instead of a shared demo account

When live mode is configured, protected app pages redirect unauthenticated requests back to `/login`.

### Production Auth Email

Supabase's built-in sender is intended for testing and is too restricted for public account creation. Production must use a custom SMTP provider.

1. Verify a dedicated sending domain with the SMTP provider.
2. Configure the provider in Supabase under Authentication, Emails, SMTP Settings.
3. Set the sender to a dedicated address such as `no-reply@auth.example.com`.
4. Replace the hosted Confirm sign up and Magic link or OTP templates with the code-based versions in:
   - `supabase/templates/confirmation.html`
   - `supabase/templates/magic_link.html`
5. Keep email confirmation enabled and the OTP length set to six digits.
6. Test signup, resend, code verification, password login, and passwordless code login with an address outside the Supabase organization.

Local Supabase uses the same templates through `supabase/config.toml`.

## July 2026 Multi-User Release

The private-account release is represented by these commits:

- `8a80d95` — account creation, login, isolated demo mode, private routine persistence, and RLS
- `c1ba7f2` — production Supabase publishable-client connection
- `bee0899` — merge of the tested release into `main`

Production verification covered `/login`, unauthenticated redirects, demo entry, and successful demo access to `/today`, `/plan`, `/train`, `/exercises`, `/progress`, and `/history`.

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
- ongoing RLS regression checks as new user-owned tables are introduced
- autosave behavior on slower networks
- mobile browser behavior on iPhone and Android
- any UI friction from longer real-world exercise names or notes

## Status

LiftLog is a deployed multi-user MVP for private adaptive programming and daily workout execution. It supports authenticated athlete accounts, isolated routines and workout records, and a safe interactive demo for first-time visitors.

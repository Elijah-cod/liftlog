create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  avatar_url text,
  unit_preference text not null default 'kg' check (unit_preference in ('kg', 'lb')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exercise_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text not null,
  media_path text not null,
  load_type text not null check (load_type in ('weighted', 'bodyweight', 'timed')),
  per_side boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  workout_name text not null,
  workout_label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_template_id uuid not null references public.workout_templates (id) on delete cascade,
  exercise_definition_id uuid not null references public.exercise_definitions (id) on delete restrict,
  sort_order integer not null,
  planned_sets integer not null,
  rest_seconds integer not null,
  block_key text,
  block_role text check (block_role in ('A', 'B')),
  unique (workout_template_id, sort_order)
);

create table if not exists public.scheduled_workouts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  workout_template_id uuid not null references public.workout_templates (id) on delete cascade,
  scheduled_date date not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, scheduled_date)
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  scheduled_workout_id uuid not null references public.scheduled_workouts (id) on delete cascade,
  workout_template_id uuid not null references public.workout_templates (id) on delete cascade,
  workout_name text not null,
  workout_label text not null,
  status text not null check (status in ('draft', 'active', 'completed', 'partial')),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_definition_id uuid not null references public.exercise_definitions (id) on delete restrict,
  sort_order integer not null,
  block_key text,
  block_role text check (block_role in ('A', 'B')),
  name text not null,
  subtitle text not null,
  load_type text not null check (load_type in ('weighted', 'bodyweight', 'timed')),
  per_side boolean not null default false,
  planned_sets integer not null,
  rest_seconds integer not null,
  media_path text not null,
  note text not null default '',
  note_updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises (id) on delete cascade,
  set_order integer not null,
  set_label text not null,
  planned boolean not null default true,
  is_extra_set boolean not null default false,
  weight numeric,
  reps integer,
  duration_seconds integer,
  completed boolean not null default false,
  previous_weight numeric,
  previous_reps integer,
  previous_duration_seconds integer,
  previous_trend text check (previous_trend in ('up', 'down', 'flat')),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_scheduled_workouts_profile_date
  on public.scheduled_workouts (profile_id, scheduled_date);

create index if not exists idx_workout_sessions_profile_started
  on public.workout_sessions (profile_id, started_at desc);

create index if not exists idx_session_exercises_session
  on public.session_exercises (workout_session_id, sort_order);

create index if not exists idx_session_sets_exercise
  on public.session_sets (session_exercise_id, set_order);

alter table public.profiles enable row level security;
alter table public.scheduled_workouts enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.session_sets enable row level security;

create policy "profiles own row"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "scheduled workouts owned by athlete"
on public.scheduled_workouts
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "workout sessions owned by athlete"
on public.workout_sessions
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "session exercises belong to owned session"
on public.session_exercises
for all
using (
  exists (
    select 1
    from public.workout_sessions
    where public.workout_sessions.id = public.session_exercises.workout_session_id
      and public.workout_sessions.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_sessions
    where public.workout_sessions.id = public.session_exercises.workout_session_id
      and public.workout_sessions.profile_id = auth.uid()
  )
);

create policy "session sets belong to owned session"
on public.session_sets
for all
using (
  exists (
    select 1
    from public.session_exercises
    join public.workout_sessions
      on public.workout_sessions.id = public.session_exercises.workout_session_id
    where public.session_exercises.id = public.session_sets.session_exercise_id
      and public.workout_sessions.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.session_exercises
    join public.workout_sessions
      on public.workout_sessions.id = public.session_exercises.workout_session_id
    where public.session_exercises.id = public.session_sets.session_exercise_id
      and public.workout_sessions.profile_id = auth.uid()
  )
);


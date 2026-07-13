create table if not exists public.training_plans (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  profile jsonb not null,
  generated_plan jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.training_plans enable row level security;

create policy "training plans owned by athlete"
on public.training_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

comment on table public.training_plans is
  'A single generated routine per athlete. Row-level security prevents cross-user access.';

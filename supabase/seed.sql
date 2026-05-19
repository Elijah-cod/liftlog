-- LiftLog MVP relational seed
-- Replace the profile UUID below with a real auth.users UUID before running this file.

insert into public.profiles (id, full_name, unit_preference)
values ('00000000-0000-0000-0000-000000000001', 'Demo Athlete', 'kg')
on conflict (id) do update
set
  full_name = excluded.full_name,
  unit_preference = excluded.unit_preference,
  updated_at = timezone('utc', now());

insert into public.exercise_definitions (slug, name, subtitle, media_path, load_type, per_side)
values
  ('flat-dumbbell-press', 'Flat Dumbbell Press', '3 working sets · 8-12 reps · smooth press', '/media/exercise-placeholder.svg', 'weighted', false),
  ('lat-pulldowns', 'Lat Pulldowns', '3 working sets · 8-12 reps · full stretch', '/media/exercise-placeholder.svg', 'weighted', false),
  ('dumbbell-romanian-deadlift', 'Dumbbell Romanian Deadlift', '3 working sets · 10-15 reps · controlled hinge', '/media/exercise-placeholder.svg', 'weighted', false),
  ('reverse-lunges', 'Reverse Lunges (*knee friendly)', '3 working sets · 8-12 reps per side · stay upright', '/media/exercise-placeholder.svg', 'weighted', true),
  ('rkc-plank', 'RKC Plank', '2 focused sets · 30-60 second holds · hard brace', '/media/exercise-placeholder.svg', 'timed', false),
  ('barbell-back-squat', 'Barbell Back Squat Progression', '3 progression sets · 6-10 reps · drive hard', '/media/exercise-placeholder.svg', 'weighted', false),
  ('barbell-deadlift', 'Barbell Deadlift Progression', '3 progression sets · 6-10 reps · clean lockout', '/media/exercise-placeholder.svg', 'weighted', false),
  ('walking-lunges', 'Walking Lunges (Quad Focused)', '3 working sets · 8-12 reps per side · long stride', '/media/exercise-placeholder.svg', 'weighted', true),
  ('seated-leg-extensions', 'Seated Leg Extensions', '3 working sets · 10-15 reps · squeeze at top', '/media/exercise-placeholder.svg', 'weighted', false),
  ('reverse-crunches', 'Reverse Crunches', '3 controlled sets · 10-20 reps · pelvis tucked', '/media/exercise-placeholder.svg', 'bodyweight', false),
  ('low-incline-dumbbell-press', 'Low Incline Dumbbell Press', '3 working sets · 8-12 reps · upper chest bias', '/media/exercise-placeholder.svg', 'weighted', false),
  ('seated-mid-chest-cable-fly', 'Seated Mid-Chest Cable Fly', '3 working sets · 10-15 reps · soft elbows', '/media/exercise-placeholder.svg', 'weighted', false),
  ('half-kneeling-cable-row', 'Half-Kneeling Cable Row', '3 working sets · 10-15 reps per side · pause at hip', '/media/exercise-placeholder.svg', 'weighted', true),
  ('incline-dumbbell-overhead-extensions', 'Incline Dumbbell Overhead Extensions', '3 working sets · 10-15 reps · full stretch', '/media/exercise-placeholder.svg', 'weighted', false),
  ('dumbbell-preacher-curl', 'Dumbbell Preacher Curl', '3 working sets · 8-12 reps per side · slow lower', '/media/exercise-placeholder.svg', 'weighted', true)
on conflict (slug) do update
set
  name = excluded.name,
  subtitle = excluded.subtitle,
  media_path = excluded.media_path,
  load_type = excluded.load_type,
  per_side = excluded.per_side;

insert into public.workout_templates (slug, workout_name, workout_label)
values
  ('workout-a', 'Upper Forge', 'Push, pull and trunk control'),
  ('workout-b', 'Lower Drive', 'Squat, hinge and trunk stability'),
  ('workout-c', 'Hybrid Pull', 'Chest, back and arm detail')
on conflict (slug) do update
set
  workout_name = excluded.workout_name,
  workout_label = excluded.workout_label;

insert into public.workout_template_exercises (
  workout_template_id,
  exercise_definition_id,
  sort_order,
  planned_sets,
  rest_seconds,
  block_key,
  block_role
)
select
  wt.id,
  ed.id,
  seeded.sort_order,
  seeded.planned_sets,
  seeded.rest_seconds,
  seeded.block_key,
  seeded.block_role
from (
  values
    ('workout-a', 'flat-dumbbell-press', 1, 3, 120, null::text, null::text),
    ('workout-a', 'lat-pulldowns', 2, 3, 90, 'a-s1', 'A'),
    ('workout-a', 'dumbbell-romanian-deadlift', 3, 3, 90, 'a-s1', 'B'),
    ('workout-a', 'reverse-lunges', 4, 3, 60, null::text, null::text),
    ('workout-a', 'rkc-plank', 5, 2, 60, null::text, null::text),
    ('workout-b', 'barbell-back-squat', 1, 3, 120, null::text, null::text),
    ('workout-b', 'barbell-deadlift', 2, 3, 120, null::text, null::text),
    ('workout-b', 'walking-lunges', 3, 3, 60, null::text, null::text),
    ('workout-b', 'seated-leg-extensions', 4, 3, 90, null::text, null::text),
    ('workout-b', 'reverse-crunches', 5, 3, 60, null::text, null::text),
    ('workout-c', 'low-incline-dumbbell-press', 1, 3, 120, null::text, null::text),
    ('workout-c', 'seated-mid-chest-cable-fly', 2, 3, 90, null::text, null::text),
    ('workout-c', 'lat-pulldowns', 3, 3, 90, null::text, null::text),
    ('workout-c', 'half-kneeling-cable-row', 4, 3, 90, null::text, null::text),
    ('workout-c', 'incline-dumbbell-overhead-extensions', 5, 3, 90, 'c-s1', 'A'),
    ('workout-c', 'dumbbell-preacher-curl', 6, 3, 90, 'c-s1', 'B')
) as seeded(template_slug, exercise_slug, sort_order, planned_sets, rest_seconds, block_key, block_role)
join public.workout_templates wt
  on wt.slug = seeded.template_slug
join public.exercise_definitions ed
  on ed.slug = seeded.exercise_slug
on conflict (workout_template_id, sort_order) do update
set
  exercise_definition_id = excluded.exercise_definition_id,
  planned_sets = excluded.planned_sets,
  rest_seconds = excluded.rest_seconds,
  block_key = excluded.block_key,
  block_role = excluded.block_role;

insert into public.scheduled_workouts (profile_id, workout_template_id, scheduled_date)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  wt.id,
  seeded.scheduled_date
from (
  values
    ('workout-a', current_date - 1),
    ('workout-b', current_date),
    ('workout-c', current_date + 1)
) as seeded(template_slug, scheduled_date)
join public.workout_templates wt
  on wt.slug = seeded.template_slug
on conflict (profile_id, scheduled_date) do update
set workout_template_id = excluded.workout_template_id;

-- Starter history so the live path can show previous values for today's workout.
insert into public.workout_sessions (
  id,
  profile_id,
  scheduled_workout_id,
  workout_template_id,
  workout_name,
  workout_label,
  status,
  started_at,
  completed_at,
  updated_at
)
select
  '10000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  sw.id,
  wt.id,
  wt.workout_name,
  wt.workout_label,
  'completed',
  timezone('utc', now()) - interval '7 days',
  timezone('utc', now()) - interval '7 days' + interval '42 minutes',
  timezone('utc', now()) - interval '7 days' + interval '42 minutes'
from public.scheduled_workouts sw
join public.workout_templates wt
  on wt.id = sw.workout_template_id
where sw.profile_id = '00000000-0000-0000-0000-000000000001'::uuid
  and sw.scheduled_date = current_date
on conflict (id) do nothing;

insert into public.session_exercises (
  id,
  workout_session_id,
  exercise_definition_id,
  sort_order,
  block_key,
  block_role,
  name,
  subtitle,
  load_type,
  per_side,
  planned_sets,
  rest_seconds,
  media_path,
  note,
  note_updated_at
)
select
  ('20000000-0000-0000-0000-00000000000' || wte.sort_order::text)::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  ed.id,
  wte.sort_order,
  wte.block_key,
  wte.block_role,
  ed.name,
  ed.subtitle,
  ed.load_type,
  ed.per_side,
  wte.planned_sets,
  wte.rest_seconds,
  ed.media_path,
  case ed.slug
    when 'flat-dumbbell-press' then 'Keep shoulder blades pinned and stop one rep before form slips.'
    when 'lat-pulldowns' then 'Open the chest first, then pull elbows toward the ribs.'
    when 'dumbbell-romanian-deadlift' then 'Own the stretch and keep the dumbbells close on the way down.'
    when 'reverse-lunges' then 'Long step back and keep pressure through the front heel.'
    when 'rkc-plank' then 'Squeeze glutes hard and exhale slowly through the brace.'
    when 'barbell-back-squat' then 'Use the first rep to find depth, then drive up fast.'
    when 'barbell-deadlift' then 'Wedge in before each rep and finish with a quiet lockout.'
    when 'walking-lunges' then 'Stay tall, control the step, and avoid rushing the turnaround.'
    when 'seated-leg-extensions' then 'Pause at the top for a clean quad squeeze.'
    when 'reverse-crunches' then 'Tuck the pelvis first, then curl the knees toward the chest.'
    when 'low-incline-dumbbell-press' then 'Keep wrists stacked and let the elbows travel slightly low.'
    when 'seated-mid-chest-cable-fly' then 'Think about meeting the biceps together, not smashing the handles.'
    when 'half-kneeling-cable-row' then 'Brace the down knee side glute and row toward the back pocket.'
    when 'incline-dumbbell-overhead-extensions' then 'Let the elbows drift back just enough to get a real stretch.'
    when 'dumbbell-preacher-curl' then 'Own the lowering phase and avoid losing tension at the bottom.'
    else ''
  end,
  timezone('utc', now()) - interval '7 days'
from public.workout_template_exercises wte
join public.workout_templates wt
  on wt.id = wte.workout_template_id
join public.exercise_definitions ed
  on ed.id = wte.exercise_definition_id
where wt.slug = 'workout-b'
on conflict (id) do nothing;

insert into public.session_sets (
  id,
  session_exercise_id,
  set_order,
  set_label,
  planned,
  is_extra_set,
  weight,
  reps,
  duration_seconds,
  completed,
  previous_weight,
  previous_reps,
  previous_duration_seconds,
  previous_trend,
  updated_at
)
select
  ('30000000-0000-0000-0000-0000000000' || se.sort_order::text || gs.set_order::text)::uuid,
  se.id,
  gs.set_order,
  gs.set_order::text || coalesce(se.block_role, ''),
  true,
  false,
  case
    when se.load_type = 'weighted' then 10 + ((se.sort_order - 1) * 2.5)
    else null
  end,
  case
    when se.load_type = 'timed' then null
    when se.load_type = 'bodyweight' then 12 - (gs.set_order - 1)
    else 10 - (gs.set_order - 1)
  end,
  case
    when se.load_type = 'timed' then 40 - ((gs.set_order - 1) * 5)
    else null
  end,
  true,
  case
    when se.load_type = 'weighted' then 10 + ((se.sort_order - 1) * 2.5)
    else null
  end,
  case
    when se.load_type = 'timed' then null
    when se.load_type = 'bodyweight' then 12 - gs.set_order
    else 9 - (gs.set_order - 1)
  end,
  case
    when se.load_type = 'timed' then 35 - ((gs.set_order - 1) * 5)
    else null
  end,
  case
    when se.load_type = 'timed' then 'up'
    else 'up'
  end,
  timezone('utc', now()) - interval '7 days'
from public.session_exercises se
cross join (values (1), (2), (3)) as gs(set_order)
where se.workout_session_id = '10000000-0000-0000-0000-000000000001'::uuid
  and not (se.load_type = 'timed' and gs.set_order > 2)
on conflict (id) do nothing;

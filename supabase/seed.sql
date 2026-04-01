-- Example seed structure for the MVP. Run after creating a real Supabase project.
-- Replace the profile UUID with a signed-up user from auth.users before executing.

insert into public.profiles (id, full_name, unit_preference)
values ('00000000-0000-0000-0000-000000000001', 'Demo Athlete', 'kg')
on conflict (id) do nothing;

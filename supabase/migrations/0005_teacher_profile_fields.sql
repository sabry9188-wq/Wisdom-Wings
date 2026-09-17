-- 0005_teacher_profile_fields.sql
-- Adds optional profile fields to public.users, used primarily for teachers
-- (date of birth, gender, address, subject(s) taught, profile photo).
-- Nullable so admin and parent accounts are unaffected.

alter table public.users
  add column date_of_birth date,
  add column gender text check (gender in ('male', 'female', 'other')),
  add column address text,
  add column subject text,
  add column photo_url text;

-- ── profile-photos storage bucket ───────────────────────────────────────
-- Private bucket for staff (teacher) profile pictures, path
-- `{user_id}/{uuid}.{ext}`. Admin has full access; a user can view their
-- own photo.

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

create or replace function public.storage_object_owner_id(object_name text)
returns uuid
language plpgsql
immutable
as $$
declare
  segment text;
  result uuid;
begin
  segment := (storage.foldername(object_name))[1];
  begin
    result := segment::uuid;
  exception when others then
    result := null;
  end;
  return result;
end;
$$;

create policy "admin manage profile photos" on storage.objects
  for all using (bucket_id = 'profile-photos' and public.is_admin())
  with check (bucket_id = 'profile-photos' and public.is_admin());

create policy "user view own profile photo" on storage.objects
  for select using (
    bucket_id = 'profile-photos'
    and public.storage_object_owner_id(name) = auth.uid()
  );

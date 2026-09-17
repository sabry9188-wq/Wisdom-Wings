-- 0004_storage.sql: student photo storage bucket + RLS
-- Objects are stored as `{student_id}/{uuid}.{ext}` so access can be scoped
-- per-student using the same helper functions as the table policies.

insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', false)
on conflict (id) do nothing;

create or replace function public.storage_object_student_id(object_name text)
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

create policy "admin manage student photos" on storage.objects
  for all using (bucket_id = 'student-photos' and public.is_admin())
  with check (bucket_id = 'student-photos' and public.is_admin());

create policy "authorized select student photos" on storage.objects
  for select using (
    bucket_id = 'student-photos'
    and (
      public.is_admin()
      or public.teaches_student(public.storage_object_student_id(name))
      or public.is_parent_of_student(public.storage_object_student_id(name))
    )
  );

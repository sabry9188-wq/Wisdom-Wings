-- 0003_rls_policies.sql: Row Level Security
-- Default-deny: RLS is enabled on every table and only the policies below
-- grant access. Admin gets full access everywhere; teachers and parents
-- are scoped to their own classes/children via the helper functions in
-- 0002_functions.sql.

-- ── users ────────────────────────────────────────────────────────────────

alter table public.users enable row level security;

create policy "admin full access users" on public.users
  for all using (public.is_admin()) with check (public.is_admin());

create policy "users select own profile" on public.users
  for select using (id = auth.uid());

create policy "users update own profile" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Note: role escalation on self-updates is blocked by the
-- prevent_role_self_escalation trigger, not by this policy.

-- ── app_settings ─────────────────────────────────────────────────────────

alter table public.app_settings enable row level security;

create policy "admin full access app_settings" on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ── classes ──────────────────────────────────────────────────────────────

alter table public.classes enable row level security;

create policy "admin full access classes" on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "teacher view assigned classes" on public.classes
  for select using (public.teaches_class(id));

create policy "parent view children classes" on public.classes
  for select using (
    exists (
      select 1 from public.students s
      where s.class_id = classes.id
        and public.is_parent_of_student(s.id)
    )
  );

-- ── class_teachers ───────────────────────────────────────────────────────

alter table public.class_teachers enable row level security;

create policy "admin full access class_teachers" on public.class_teachers
  for all using (public.is_admin()) with check (public.is_admin());

create policy "teacher view own class_teachers rows" on public.class_teachers
  for select using (teacher_id = auth.uid());

-- ── students ─────────────────────────────────────────────────────────────

alter table public.students enable row level security;

create policy "admin full access students" on public.students
  for all using (public.is_admin()) with check (public.is_admin());

create policy "teacher view own class students" on public.students
  for select using (public.teaches_class(class_id));

create policy "parent view own children" on public.students
  for select using (public.is_parent_of_student(id));

-- ── parent_student ───────────────────────────────────────────────────────

alter table public.parent_student enable row level security;

create policy "admin full access parent_student" on public.parent_student
  for all using (public.is_admin()) with check (public.is_admin());

create policy "parent view own links" on public.parent_student
  for select using (parent_id = auth.uid());

-- ── attendance ───────────────────────────────────────────────────────────

alter table public.attendance enable row level security;

create policy "admin full access attendance" on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

create policy "teacher manage own class attendance" on public.attendance
  for all using (public.teaches_class(class_id))
  with check (public.teaches_class(class_id));

create policy "parent view own children attendance" on public.attendance
  for select using (public.is_parent_of_student(student_id));

-- ── fees ─────────────────────────────────────────────────────────────────
-- Teachers have no access to fees/payments per spec — default-deny for them.

alter table public.fees enable row level security;

create policy "admin full access fees" on public.fees
  for all using (public.is_admin()) with check (public.is_admin());

create policy "parent view own children fees" on public.fees
  for select using (public.is_parent_of_student(student_id));

-- ── payments ─────────────────────────────────────────────────────────────

alter table public.payments enable row level security;

create policy "admin full access payments" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "parent view own children payments" on public.payments
  for select using (
    exists (
      select 1 from public.fees f
      where f.id = payments.fee_id
        and public.is_parent_of_student(f.student_id)
    )
  );

-- ── sms_logs ─────────────────────────────────────────────────────────────

alter table public.sms_logs enable row level security;

create policy "admin full access sms_logs" on public.sms_logs
  for all using (public.is_admin()) with check (public.is_admin());

create policy "parent view own sms_logs" on public.sms_logs
  for select using (recipient_user_id = auth.uid());

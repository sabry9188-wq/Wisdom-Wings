-- 0002_functions.sql: helper functions, triggers, business rules

-- ── updated_at maintenance ───────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.classes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.students
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.attendance
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.fees
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.sms_logs
  for each row execute function public.set_updated_at();

-- ── RLS helper functions (security definer to avoid RLS recursion) ─────────
-- search_path is pinned to prevent search_path hijacking in security
-- definer functions.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.teaches_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.class_teachers ct
    join public.users u on u.id = ct.teacher_id
    where ct.class_id = p_class_id
      and ct.teacher_id = auth.uid()
      and u.is_active
  );
$$;

create or replace function public.teaches_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.students s
    join public.class_teachers ct on ct.class_id = s.class_id
    join public.users u on u.id = ct.teacher_id
    where s.id = p_student_id
      and ct.teacher_id = auth.uid()
      and u.is_active
  );
$$;

create or replace function public.is_parent_of_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.parent_student ps
    join public.users u on u.id = ps.parent_id
    where ps.student_id = p_student_id
      and ps.parent_id = auth.uid()
      and u.is_active
  );
$$;

-- ── Guardrail: a non-admin cannot change their own role ─────────────────

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Only an admin can change a user role';
  end if;
  return new;
end;
$$;

create trigger prevent_role_self_escalation before update on public.users
  for each row execute function public.prevent_role_self_escalation();

-- ── Guardrail: attendance edit window ────────────────────────────────────
-- A teacher can only edit an attendance row within
-- app_settings.attendance_edit_window_hours of when it was marked.
-- Admins are exempt.

create or replace function public.enforce_attendance_edit_window()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  window_hours numeric;
begin
  if public.is_admin() then
    return new;
  end if;

  select value::numeric into window_hours
  from public.app_settings
  where key = 'attendance_edit_window_hours';

  if window_hours is null then
    window_hours := 24;
  end if;

  if now() - old.marked_at > (window_hours || ' hours')::interval then
    raise exception 'Attendance can no longer be edited (edit window has passed)';
  end if;

  return new;
end;
$$;

create trigger enforce_attendance_edit_window before update on public.attendance
  for each row execute function public.enforce_attendance_edit_window();

-- ── Receipt numbers ──────────────────────────────────────────────────────

create or replace function public.generate_receipt_number()
returns text
language sql
as $$
  select 'RCPT-' || lpad(nextval('public.receipt_number_seq')::text, 6, '0');
$$;

create or replace function public.set_receipt_number()
returns trigger
language plpgsql
as $$
begin
  if new.receipt_number is null or new.receipt_number = '' then
    new.receipt_number := public.generate_receipt_number();
  end if;
  return new;
end;
$$;

create trigger set_receipt_number before insert on public.payments
  for each row execute function public.set_receipt_number();

-- ── Fee status recompute ─────────────────────────────────────────────────
-- Supports partial payments: after any payment insert/update/delete, the
-- parent fee's status is recomputed from the sum of its payments.

create or replace function public.recompute_fee_status()
returns trigger
language plpgsql
as $$
declare
  target_fee_id uuid;
  fee_amount numeric;
  paid_amount numeric;
begin
  target_fee_id := coalesce(new.fee_id, old.fee_id);

  select amount into fee_amount from public.fees where id = target_fee_id;
  select coalesce(sum(amount), 0) into paid_amount
  from public.payments where fee_id = target_fee_id;

  update public.fees
  set status = case
    when paid_amount <= 0 then 'unpaid'
    when paid_amount >= fee_amount then 'paid'
    else 'partially_paid'
  end::public.fee_status
  where id = target_fee_id;

  return coalesce(new, old);
end;
$$;

create trigger recompute_fee_status_on_insert after insert on public.payments
  for each row execute function public.recompute_fee_status();
create trigger recompute_fee_status_on_update after update on public.payments
  for each row execute function public.recompute_fee_status();
create trigger recompute_fee_status_on_delete after delete on public.payments
  for each row execute function public.recompute_fee_status();

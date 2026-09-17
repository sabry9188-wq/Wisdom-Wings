-- Wisdom Wings — Class Management System
-- 0001_schema.sql: core tables, enums, constraints, indexes

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────

create type public.user_role as enum ('admin', 'teacher', 'parent');
create type public.attendance_status as enum ('present', 'absent', 'late');
create type public.fee_status as enum ('unpaid', 'partially_paid', 'paid');
create type public.sms_type as enum ('fee_reminder', 'absence_alert', 'manual');
create type public.sms_status as enum ('queued', 'sent', 'delivered', 'failed');

-- ── users ────────────────────────────────────────────────────────────────
-- Mirrors auth.users with app-specific profile data + role.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users (role);

-- ── app_settings ─────────────────────────────────────────────────────────
-- Small key/value store backing the admin "Settings" page.

create table public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('attendance_edit_window_hours', '24');

-- ── classes ──────────────────────────────────────────────────────────────

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text,
  academic_year text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── class_teachers ───────────────────────────────────────────────────────
-- Many-to-many: a teacher may be assigned to several classes.

create table public.class_teachers (
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, teacher_id)
);

create index class_teachers_teacher_idx on public.class_teachers (teacher_id);

-- ── students ─────────────────────────────────────────────────────────────

create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text not null unique,
  full_name text not null,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  class_id uuid references public.classes (id) on delete set null,
  photo_url text,
  contact_phone text,
  contact_address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index students_class_idx on public.students (class_id);
create index students_active_idx on public.students (is_active);

-- ── parent_student ───────────────────────────────────────────────────────
-- Many-to-many: a parent may have several children; a student may have
-- more than one guardian.

create table public.parent_student (
  parent_id uuid not null references public.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  relationship text,
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create index parent_student_student_idx on public.parent_student (student_id);

-- ── attendance ───────────────────────────────────────────────────────────
-- unique(student_id, date) prevents duplicate attendance at the DB level.

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  date date not null,
  status public.attendance_status not null,
  marked_by uuid not null references public.users (id),
  marked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, date)
);

create index attendance_class_date_idx on public.attendance (class_id, date);
create index attendance_student_idx on public.attendance (student_id);

-- ── fees ─────────────────────────────────────────────────────────────────
-- "overdue" is not stored — it's derived at query time as
-- status <> 'paid' and due_date < current_date, so it can never drift.

create table public.fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid references public.classes (id) on delete set null,
  title text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  due_date date not null,
  status public.fee_status not null default 'unpaid',
  created_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index fees_student_idx on public.fees (student_id);
create index fees_status_idx on public.fees (status);
create index fees_due_date_idx on public.fees (due_date);

-- ── payments ─────────────────────────────────────────────────────────────

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  fee_id uuid not null references public.fees (id) on delete cascade,
  receipt_number text not null unique,
  amount numeric(10, 2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  method text not null default 'cash',
  recorded_by uuid references public.users (id),
  notes text,
  created_at timestamptz not null default now()
);

create index payments_fee_idx on public.payments (fee_id);

create sequence public.receipt_number_seq start 1;

-- ── sms_logs ─────────────────────────────────────────────────────────────

create table public.sms_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_phone text not null,
  recipient_user_id uuid references public.users (id),
  student_id uuid references public.students (id),
  type public.sms_type not null,
  message text not null,
  status public.sms_status not null default 'queued',
  provider text,
  provider_message_id text,
  error_message text,
  sent_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sms_logs_recipient_idx on public.sms_logs (recipient_user_id);
create index sms_logs_student_idx on public.sms_logs (student_id);
create index sms_logs_created_idx on public.sms_logs (created_at desc);

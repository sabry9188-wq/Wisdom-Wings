# Wisdom Wings — Class Management System

A web-based class management system for Admins, Teachers, and Parents:
student/teacher/parent management, class assignment, attendance, fee &
payment tracking, and SMS notifications (pluggable provider, MVP defaults to
a console logger).

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · Supabase
(Postgres, Auth, Storage) · Vercel.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL**, the **anon
   public key**, and the **service_role key** (keep the service-role key
   secret — never commit it or expose it to the browser).

## 2. Run the database migrations

In the Supabase dashboard, open **SQL Editor** and run the files in
`supabase/migrations/` **in order**:

1. `0001_schema.sql` — tables, enums, indexes
2. `0002_functions.sql` — RLS helper functions, triggers (receipt numbers,
   fee status recompute, attendance edit window, role-escalation guard)
3. `0003_rls_policies.sql` — Row Level Security policies
4. `0004_storage.sql` — creates the private `student-photos` Storage bucket
   and its access policies

Each file is idempotent-ish for a fresh project, but they must be run once,
in order, on an empty database.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from step 1. Leave `SMS_PROVIDER=console` for
now — see [SMS providers](#sms-providers) below.

## 4. Install dependencies and create the first Admin

```bash
npm install
npm run create-admin -- --email admin@yourschool.com --password "Str0ngPass!23" --name "School Admin"
```

This is the **only** way an Admin account is created — there is no public
admin sign-up. The Admin then creates Teacher and Parent accounts from
**Admin → Teachers / Parents** in the app.

## 5. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in with the
Admin account you just created.

## SMS providers

`src/lib/sms/` defines an `SmsProvider` interface. The MVP ships with a
`console` provider (`src/lib/sms/providers/console-provider.ts`) that logs
messages instead of sending them, so the fee-reminder and absence-alert
workflows — and the `sms_logs` table — are fully wired end-to-end without a
real gateway. To connect a real provider later:

1. Add a new file under `src/lib/sms/providers/` implementing `SmsProvider`.
2. Add a case for it in the factory in `src/lib/sms/index.ts`.
3. Set `SMS_PROVIDER` (and any provider-specific env vars) in `.env.local`
   and in Vercel's environment variables.

No changes are needed anywhere else — `/api/sms/send` calls the factory, not
a specific provider.

## Deploying to Vercel

1. Push this repository to GitHub (already connected).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env.local` to the Vercel
   project (**Project Settings → Environment Variables**), for both
   Production and Preview.
4. In Supabase, under **Authentication → URL Configuration**, add your
   Vercel production domain (and any preview domains you use) to the
   **Redirect URLs** allow-list, so `resetPasswordForEmail` links work in
   production.
5. Deploy.

## Security notes

- Row Level Security is enabled on every table; the Next.js `proxy.ts`
  (route protection) is a UX convenience layered on top — RLS is the real
  security boundary.
- `SUPABASE_SERVICE_ROLE_KEY` is only read from server-only code
  (`src/lib/supabase/admin.ts`, guarded with the `server-only` package, and
  `scripts/create-admin.ts`). It is never prefixed with `NEXT_PUBLIC_` and
  must never be committed.
- Student photos live in a **private** Supabase Storage bucket; access is
  scoped per-student via the same RLS helper functions used for the
  database tables.

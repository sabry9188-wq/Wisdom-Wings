import Link from "next/link";
import {
  GraduationCap,
  ClipboardCheck,
  Wallet,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Users,
  Receipt,
  LayoutDashboard,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, LogoFull } from "@/components/layout/logo";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Student Records",
    description:
      "Profiles, photos, guardians, and class assignments — organized and searchable in one place.",
  },
  {
    icon: ClipboardCheck,
    title: "Fast Attendance",
    description:
      "Mark a whole class present/absent/late in seconds, with duplicate-proof daily records.",
  },
  {
    icon: Wallet,
    title: "Fee & Payment Tracking",
    description:
      "Create fees per class or student, record part-payments, and issue unique receipts automatically.",
  },
  {
    icon: MessageSquareText,
    title: "SMS Reminders",
    description:
      "Send fee reminders and absence alerts to parents, with every message logged.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Admins, teachers, and parents each see only what they should — enforced at the database level.",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description:
      "A clean, responsive interface that's just as fast on a teacher's phone as on the office desktop.",
  },
];

const AT_A_GLANCE = [
  { icon: LayoutDashboard, value: "3", label: "Role-Based Dashboards" },
  { icon: ClipboardCheck, value: "1-Tap", label: "Attendance Marking" },
  { icon: Receipt, value: "100%", label: "Unique Receipt Numbers" },
  { icon: Lock, value: "Row-Level", label: "Security, by Design" },
];

const ROLE_CARDS = [
  {
    icon: ShieldCheck,
    role: "Admin",
    copy: "Full control — students, staff, classes, fees, and SMS, all from one dashboard.",
  },
  {
    icon: Users,
    role: "Teacher",
    copy: "See only your assigned classes and mark attendance in a couple of taps.",
  },
  {
    icon: GraduationCap,
    role: "Parent",
    copy: "Check your child's attendance, fee status, and payment history anytime.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white">
      {/* Utility bar */}
      <div className="bg-brand-900 py-2 text-center text-xs font-medium text-brand-100">
        Wisdom Wings Class Management System — To Fly High
      </div>

      {/* Nav */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href="/login">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-500 opacity-20 blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
          <LogoFull
            width={200}
            className="mb-8 rounded-2xl bg-white/95 p-4 shadow-xl shadow-black/20"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-accent-200">
            Built for schools, from day one
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Run your school day
            <span className="text-accent-400"> without the spreadsheets</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-100">
            Wisdom Wings brings students, attendance, and fees into one clean
            system — with dedicated dashboards for admins, teachers, and
            parents.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/login">
              <Button
                size="md"
                className="w-full bg-accent-500 shadow-accent-900/30 hover:bg-accent-400 sm:w-auto"
              >
                Sign in to your account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* At a glance stat band */}
      <section className="border-b border-slate-100 bg-brand-50">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {AT_A_GLANCE.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center">
              <item.icon className="h-6 w-6 text-accent-600" strokeWidth={2} />
              <p className="mt-2 text-2xl font-extrabold text-brand-800">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-600">
            Modules
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Everything the front office needs
          </h2>
          <p className="mt-3 text-slate-600">
            Purpose-built modules for the parts of school administration that
            actually eat up your week.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <feature.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Role callouts */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-600">
              Built for everyone
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              One system, three points of view
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ROLE_CARDS.map((item) => (
              <div
                key={item.role}
                className="rounded-2xl bg-white p-6 text-center shadow-sm shadow-slate-200/60"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <item.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {item.role}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-900 text-brand-100">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-6 py-14 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-brand-200">
              To Fly High — class management built for schools.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
              Roles
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-brand-200">Admin</li>
              <li className="text-brand-200">Teacher</li>
              <li className="text-brand-200">Parent</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
              Modules
            </p>
            <ul className="mt-4 space-y-2 text-sm text-brand-200">
              <li>Attendance</li>
              <li>Fees &amp; Payments</li>
              <li>SMS Center</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
              Account
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-brand-200 hover:text-white">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="text-brand-200 hover:text-white">
                  Forgot password
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-brand-300">
          © {new Date().getFullYear()} Wisdom Wings Class Management System
        </div>
      </footer>
    </div>
  );
}

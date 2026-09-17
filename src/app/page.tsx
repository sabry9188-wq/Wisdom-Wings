import Link from "next/link";
import {
  GraduationCap,
  ClipboardCheck,
  Wallet,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link href="/login">
          <Button size="sm">Sign in</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative isolate">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 -z-10 flex justify-center blur-3xl"
        >
          <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-indigo-300 via-violet-200 to-amber-200 opacity-40" />
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Built for schools, from day one
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Run your school day
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {" "}without the spreadsheets
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Wisdom Wings brings students, attendance, and fees into one clean
            system — with dedicated dashboards for admins, teachers, and
            parents.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/login">
              <Button className="w-full sm:w-auto">
                Sign in to your account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
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
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                role: "Admin",
                copy: "Full control — students, staff, classes, fees, and SMS, all from one dashboard.",
              },
              {
                role: "Teacher",
                copy: "See only your assigned classes and mark attendance in a couple of taps.",
              },
              {
                role: "Parent",
                copy: "Check your child's attendance, fee status, and payment history anytime.",
              },
            ].map((item) => (
              <div
                key={item.role}
                className="rounded-2xl bg-white p-6 text-center shadow-sm shadow-slate-200/60"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {item.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-400 sm:flex-row">
        <span>© {new Date().getFullYear()} Wisdom Wings Class Management System</span>
        <Link href="/login" className="text-slate-500 hover:text-indigo-600">
          Sign in →
        </Link>
      </footer>
    </div>
  );
}

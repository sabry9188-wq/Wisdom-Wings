import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 to-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-semibold text-slate-900">Wisdom Wings</span>
        <Link href="/login">
          <Button size="sm">Login</Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Class Management, simplified
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-600">
          Attendance, fees, and student records for admins, teachers, and
          parents — all in one place.
        </p>
        <Link href="/login" className="mt-8">
          <Button>Sign in to your account</Button>
        </Link>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-slate-400">
        Wisdom Wings Class Management System
      </footer>
    </div>
  );
}

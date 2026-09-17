"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Logo } from "@/components/layout/logo";
import { ROLE_LABEL } from "@/components/layout/nav-config";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/database";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardShell({
  role,
  userName,
  children,
}: {
  role: UserRole;
  userName: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
          <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 sm:inline">
            {ROLE_LABEL[role]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
              {initials(userName)}
            </span>
            <span className="text-sm font-medium text-slate-700">{userName}</span>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white md:block">
          <Sidebar role={role} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <Logo />
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div onClick={() => setMobileOpen(false)}>
                <Sidebar role={role} />
              </div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

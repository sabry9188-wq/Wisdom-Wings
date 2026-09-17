"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ROLE_LABEL } from "@/components/layout/nav-config";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/database";

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
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <span className="text-lg font-semibold text-slate-900">
            Wisdom Wings
          </span>
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 sm:inline">
            {ROLE_LABEL[role]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">
            {userName}
          </span>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
          <Sidebar role={role} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-200 p-3">
                <span className="font-semibold text-slate-900">Menu</span>
                <button
                  type="button"
                  className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  ✕
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

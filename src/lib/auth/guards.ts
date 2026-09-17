import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import type { UserRole } from "@/types/database";

/**
 * For use at the top of a Server Component page. Redirects to /login if
 * there's no session, or to the user's own dashboard if their role doesn't
 * match. This is a UX convenience layer on top of RLS — RLS remains the
 * real security boundary since it's enforced regardless of what the UI does.
 */
export async function requireRole(role: UserRole): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    redirect(`/${user.role}/dashboard`);
  }

  return user;
}

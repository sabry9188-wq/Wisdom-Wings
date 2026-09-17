import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type CurrentUser = Database["public"]["Tables"]["users"]["Row"];

/**
 * Returns the current authenticated user's profile row (role, name, etc.),
 * or null if there is no session / no matching row. Safe to call from
 * Server Components and Route Handlers.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

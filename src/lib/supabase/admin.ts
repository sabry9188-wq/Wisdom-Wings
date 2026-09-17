import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client — bypasses RLS entirely. Only import this
 * from server-only code (Route Handlers, scripts) that has already verified
 * the caller is an authenticated admin. Never import from a Client
 * Component or expose SUPABASE_SERVICE_ROLE_KEY via NEXT_PUBLIC_*.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/**
 * One-time bootstrap script — creates the first Admin account.
 * Run locally only (never deployed, never run with an untrusted env):
 *
 *   npm run create-admin -- --email admin@school.com --password "Str0ngPass!" --name "School Admin"
 *
 * Requires .env.local to contain NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY (the service-role key — keep it secret).
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = getArg("email");
  const password = getArg("password");
  const name = getArg("name") ?? "Admin";

  if (!email || !password) {
    console.error(
      'Usage: npm run create-admin -- --email you@school.com --password "Str0ngPass!" --name "Full Name"',
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    console.error("Failed to create auth user:", createError?.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase.from("users").insert({
    id: created.user.id,
    role: "admin",
    full_name: name,
    email,
    is_active: true,
  });

  if (profileError) {
    console.error("Failed to create admin profile row:", profileError.message);
    process.exit(1);
  }

  console.log(`Admin account created for ${email}. You can now log in.`);
}

main();

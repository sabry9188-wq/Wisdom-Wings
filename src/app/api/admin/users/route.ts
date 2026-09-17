import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema } from "@/lib/validations/admin-user";
import { generateTempPassword } from "@/lib/generate-temp-password";

/**
 * Admin-only: creates a Teacher or Parent account. Teachers and parents can
 * never self-register — this is the only path that creates one.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { role, full_name, email, phone } = parsed.data;
  const tempPassword = generateTempPassword();
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    const message = createError?.message.includes("already been registered")
      ? "A user with that email already exists."
      : (createError?.message ?? "Failed to create user");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { error: profileError } = await admin.from("users").insert({
    id: created.user.id,
    role,
    full_name,
    email,
    phone: phone || null,
    is_active: true,
  });

  if (profileError) {
    // Roll back the auth user so we don't leave an orphaned account.
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({
    id: created.user.id,
    tempPassword,
  });
}

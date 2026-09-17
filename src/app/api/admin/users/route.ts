import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema } from "@/lib/validations/admin-user";
import { generateTempPassword } from "@/lib/generate-temp-password";

/**
 * Admin-only: creates a Teacher or Parent account. Teachers and parents can
 * never self-register — this is the only path that creates one. Accepts
 * multipart form data so an optional profile photo can be uploaded in the
 * same request (the storage path needs the auth user's id, which only
 * exists after createUser() below).
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

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  const parsed = createUserSchema.safeParse({
    role: field("role"),
    full_name: field("full_name"),
    email: field("email"),
    phone: field("phone"),
    date_of_birth: field("date_of_birth"),
    gender: field("gender"),
    address: field("address"),
    subject: field("subject"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const photo = formData.get("photo");
  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;

  const { role, full_name, email, phone, date_of_birth, gender, address, subject } = parsed.data;
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

  let photoPath: string | null = null;
  if (photoFile) {
    const extension = photoFile.name.split(".").pop() ?? "jpg";
    const path = `${created.user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("profile-photos")
      .upload(path, photoFile, { contentType: photoFile.type });
    if (!uploadError) {
      photoPath = path;
    }
    // A failed photo upload isn't fatal — the account still gets created.
  }

  const { error: profileError } = await admin.from("users").insert({
    id: created.user.id,
    role,
    full_name,
    email,
    phone: phone || null,
    is_active: true,
    date_of_birth: date_of_birth || null,
    gender: (gender || null) as "male" | "female" | "other" | null,
    address: address || null,
    subject: subject || null,
    photo_url: photoPath,
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

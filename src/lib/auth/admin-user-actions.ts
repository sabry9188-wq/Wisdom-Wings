"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfileFieldsSchema } from "@/lib/validations/admin-user";
import type { Database } from "@/types/database";

/** Admin editing a teacher or parent's profile. Email is immutable post-creation. */
export async function updateUserProfileAction(
  userId: string,
  listPath: string,
  formData: FormData,
) {
  const parsed = updateProfileFieldsSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    address: formData.get("address"),
    subject: formData.get("subject"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const photoPath = formData.get("photo_path");
  const supabase = await createClient();

  const update: Database["public"]["Tables"]["users"]["Update"] = {
    full_name: parsed.data.full_name,
    phone: parsed.data.phone || null,
    date_of_birth: parsed.data.date_of_birth || null,
    gender: (parsed.data.gender || null) as "male" | "female" | "other" | null,
    address: parsed.data.address || null,
    subject: parsed.data.subject || null,
  };
  if (typeof photoPath === "string" && photoPath) {
    update.photo_url = photoPath;
  }

  const { error } = await supabase.from("users").update(update).eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath(listPath);
  revalidatePath(`${listPath}/${userId}`);
  return { success: true };
}

export async function toggleUserActiveAction(
  userId: string,
  isActive: boolean,
  listPath: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath(listPath);
  revalidatePath(`${listPath}/${userId}`);
  return { success: true };
}

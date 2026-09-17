"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfileFieldsSchema } from "@/lib/validations/admin-user";

/** Admin editing a teacher or parent's name/phone. Email is immutable post-creation. */
export async function updateUserProfileAction(
  userId: string,
  listPath: string,
  formData: FormData,
) {
  const parsed = updateProfileFieldsSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("id", userId);

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

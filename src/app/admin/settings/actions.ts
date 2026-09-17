"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAttendanceEditWindowAction(formData: FormData) {
  const hours = Number(formData.get("attendance_edit_window_hours"));

  if (!Number.isFinite(hours) || hours < 0) {
    return { error: "Enter a valid number of hours." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ value: String(hours) })
    .eq("key", "attendance_edit_window_hours");

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}

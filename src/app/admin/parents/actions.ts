"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function syncParentStudentsAction(
  parentId: string,
  studentIds: string[],
) {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("parent_student")
    .delete()
    .eq("parent_id", parentId);

  if (deleteError) return { error: deleteError.message };

  if (studentIds.length > 0) {
    const { error: insertError } = await supabase.from("parent_student").insert(
      studentIds.map((studentId) => ({ parent_id: parentId, student_id: studentId })),
    );
    if (insertError) return { error: insertError.message };
  }

  revalidatePath(`/admin/parents/${parentId}`);
  revalidatePath("/admin/students");
  return { success: true };
}

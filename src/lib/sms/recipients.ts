import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface GuardianRecipient {
  studentId: string;
  studentName: string;
  parentId: string;
  phone: string;
}

/**
 * Resolves the guardian(s) with a phone number on file for each student.
 * A student can have more than one guardian, so this can return multiple
 * rows per student.
 */
export async function getGuardianRecipients(
  supabase: SupabaseClient<Database>,
  studentIds: string[],
): Promise<GuardianRecipient[]> {
  if (studentIds.length === 0) return [];

  const { data } = await supabase
    .from("parent_student")
    .select("student_id, students(full_name), users(id, phone, is_active)")
    .in("student_id", studentIds);

  const recipients: GuardianRecipient[] = [];
  for (const row of data ?? []) {
    if (!row.users?.phone || !row.users.is_active) continue;
    recipients.push({
      studentId: row.student_id,
      studentName: row.students?.full_name ?? "",
      parentId: row.users.id,
      phone: row.users.phone,
    });
  }
  return recipients;
}

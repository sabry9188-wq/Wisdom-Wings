"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markAttendanceSchema } from "@/lib/validations/attendance";
import type { AttendanceStatus } from "@/types/database";

export async function markAttendanceAction(
  classId: string,
  date: string,
  records: { student_id: string; status: AttendanceStatus }[],
) {
  const parsed = markAttendanceSchema.safeParse({ class_id: classId, date, records });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const rows = parsed.data.records.map((r) => ({
    student_id: r.student_id,
    class_id: parsed.data.class_id,
    date: parsed.data.date,
    status: r.status,
    marked_by: user.id,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/teacher/attendance");
  revalidatePath("/teacher/attendance/history");
  revalidatePath("/teacher/dashboard");
  return { success: true };
}

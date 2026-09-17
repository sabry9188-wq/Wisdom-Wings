import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ClassDateSelector } from "@/components/attendance/class-date-selector";
import { MarkAttendanceGrid } from "@/components/attendance/mark-attendance-grid";
import type { AttendanceStatus } from "@/types/database";

export default async function MarkAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; date?: string }>;
}) {
  const user = await requireRole("teacher");
  const { class: classParam, date: dateParam } = await searchParams;
  const supabase = await createClient();

  const { data: assignedClasses } = await supabase
    .from("class_teachers")
    .select("classes(id, name, section)")
    .eq("teacher_id", user.id);

  const classes = (assignedClasses ?? [])
    .map((c) => c.classes)
    .filter((c): c is NonNullable<typeof c> => !!c);

  const selectedClassId = classParam || classes[0]?.id;
  const selectedDate = dateParam || new Date().toISOString().slice(0, 10);

  if (!selectedClassId) {
    return (
      <div>
        <PageHeader title="Mark Attendance" />
        <p className="text-sm text-slate-500">
          You have no assigned classes yet. Contact the admin.
        </p>
      </div>
    );
  }

  const [{ data: students }, { data: existingRows }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, student_code")
      .eq("class_id", selectedClassId)
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("attendance")
      .select("student_id, status")
      .eq("class_id", selectedClassId)
      .eq("date", selectedDate),
  ]);

  const existing: Record<string, AttendanceStatus> = {};
  existingRows?.forEach((r) => {
    existing[r.student_id] = r.status;
  });

  return (
    <div>
      <PageHeader title="Mark Attendance" description="Select a class and date" />
      <ClassDateSelector
        classes={classes}
        selectedClassId={selectedClassId}
        selectedDate={selectedDate}
      />
      <MarkAttendanceGrid
        key={`${selectedClassId}-${selectedDate}`}
        classId={selectedClassId}
        date={selectedDate}
        students={students ?? []}
        existing={existing}
      />
    </div>
  );
}

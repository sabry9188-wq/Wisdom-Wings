import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { AttendanceBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ClassDateSelector } from "@/components/attendance/class-date-selector";

export default async function AttendanceHistoryPage({
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

  let records: {
    id: string;
    date: string;
    status: "present" | "absent" | "late";
    students: { full_name: string } | null;
  }[] = [];

  if (selectedClassId) {
    let query = supabase
      .from("attendance")
      .select("id, date, status, students(full_name)")
      .eq("class_id", selectedClassId)
      .order("date", { ascending: false })
      .limit(100);

    if (dateParam) {
      query = query.eq("date", dateParam);
    }

    const { data } = await query;
    records = data ?? [];
  }

  return (
    <div>
      <PageHeader title="Attendance History" />
      {classes.length > 0 ? (
        <ClassDateSelector
          classes={classes}
          selectedClassId={selectedClassId ?? ""}
          selectedDate={dateParam ?? ""}
        />
      ) : null}

      <Card>
        <CardBody className="p-0">
          {records.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Student</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <Td>{formatDate(r.date)}</Td>
                    <Td>{r.students?.full_name}</Td>
                    <Td>
                      <AttendanceBadge status={r.status} />
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No attendance records found." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

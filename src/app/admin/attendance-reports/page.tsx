import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, StatCard } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { AttendanceBadge } from "@/components/ui/badge";
import { AttendanceReportFilterBar } from "@/components/attendance/attendance-report-filter-bar";
import { formatDate } from "@/lib/utils";

export default async function AttendanceReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; from?: string; to?: string }>;
}) {
  await requireRole("admin");
  const { class: classId, from, to } = await searchParams;
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, section")
    .eq("is_active", true)
    .order("name");

  let query = supabase
    .from("attendance")
    .select("id, date, status, students(full_name), classes(name, section)")
    .order("date", { ascending: false })
    .limit(200);

  if (classId) query = query.eq("class_id", classId);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data: records } = await query;

  const presentCount = records?.filter((r) => r.status === "present").length ?? 0;
  const absentCount = records?.filter((r) => r.status === "absent").length ?? 0;
  const lateCount = records?.filter((r) => r.status === "late").length ?? 0;

  return (
    <div>
      <PageHeader title="Attendance Reports" description="Filter by class and date range" />

      <AttendanceReportFilterBar classes={classes ?? []} />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Present" value={presentCount} />
        <StatCard label="Absent" value={absentCount} />
        <StatCard label="Late" value={lateCount} />
      </div>

      <Card>
        <CardBody className="p-0">
          {records && records.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Student</Th>
                  <Th>Class</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <Td>{formatDate(r.date)}</Td>
                    <Td>{r.students?.full_name}</Td>
                    <Td>
                      {r.classes
                        ? `${r.classes.name}${r.classes.section ? ` - ${r.classes.section}` : ""}`
                        : "—"}
                    </Td>
                    <Td>
                      <AttendanceBadge status={r.status} />
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No attendance records match these filters." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { AttendanceBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function TeacherDashboardPage() {
  const user = await requireRole("teacher");
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: classRows } = await supabase
    .from("class_teachers")
    .select("class_id, classes(id, name, section)")
    .eq("teacher_id", user.id);

  const classIds = classRows?.map((c) => c.class_id) ?? [];

  const [studentsCount, todayAttendance, recentAttendance] = await Promise.all(
    [
      classIds.length
        ? supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .in("class_id", classIds)
            .eq("is_active", true)
        : Promise.resolve({ count: 0 }),
      classIds.length
        ? supabase
            .from("attendance")
            .select("class_id")
            .eq("date", today)
            .in("class_id", classIds)
        : Promise.resolve({ data: [] as { class_id: string }[] }),
      classIds.length
        ? supabase
            .from("attendance")
            .select("id, date, status, students(full_name), classes(name)")
            .in("class_id", classIds)
            .order("marked_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] }),
    ],
  );

  const markedClassIds = new Set(
    (todayAttendance as { data?: { class_id: string }[] }).data?.map(
      (a) => a.class_id,
    ),
  );

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${user.full_name}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Assigned Classes" value={classRows?.length ?? 0} />
        <StatCard label="Total Students" value={studentsCount.count ?? 0} />
        <StatCard
          label="Attendance Marked Today"
          value={`${markedClassIds.size}/${classRows?.length ?? 0}`}
          hint="classes"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="My classes"
            action={
              <Link href="/teacher/classes" className="text-sm text-indigo-600 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            {classRows && classRows.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Class</Th>
                    <Th>Today</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {classRows.map((c) => (
                    <tr key={c.class_id}>
                      <Td>
                        {c.classes?.name}
                        {c.classes?.section ? ` - ${c.classes.section}` : ""}
                      </Td>
                      <Td>
                        {markedClassIds.has(c.class_id) ? (
                          <span className="text-green-700">Marked</span>
                        ) : (
                          <Link
                            href={`/teacher/attendance?class=${c.class_id}`}
                            className="text-indigo-600 hover:underline"
                          >
                            Mark now
                          </Link>
                        )}
                      </Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState message="No classes assigned yet." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent attendance" />
          <CardBody className="p-0">
            {recentAttendance.data && recentAttendance.data.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Student</Th>
                    <Th>Class</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {recentAttendance.data.map((a) => (
                    <tr key={a.id}>
                      <Td>{a.students?.full_name}</Td>
                      <Td>{a.classes?.name}</Td>
                      <Td>
                        <AttendanceBadge status={a.status} />
                      </Td>
                      <Td>{formatDate(a.date)}</Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState message="No attendance recorded yet." />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

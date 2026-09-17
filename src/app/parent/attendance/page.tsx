import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { AttendanceBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function ParentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const user = await requireRole("parent");
  const { child } = await searchParams;
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("parent_student")
    .select("students(id, full_name)")
    .eq("parent_id", user.id);

  const children = (links ?? [])
    .map((l) => l.students)
    .filter((s): s is NonNullable<typeof s> => !!s);

  const studentIds = child ? [child] : children.map((c) => c.id);

  const { data: records } = studentIds.length
    ? await supabase
        .from("attendance")
        .select("id, date, status, students(full_name)")
        .in("student_id", studentIds)
        .order("date", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <div>
      <PageHeader title="Attendance" />

      {children.length > 1 ? (
        <form method="GET" className="mb-4 flex max-w-md gap-2">
          <Select name="child" defaultValue={child ?? ""} className="flex-1">
            <option value="">All children</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      ) : null}

      <Card>
        <CardBody className="p-0">
          {records && records.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Child</Th>
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
            <EmptyState message="No attendance records yet." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

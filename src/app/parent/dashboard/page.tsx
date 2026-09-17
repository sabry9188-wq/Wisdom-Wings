import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { AttendanceBadge, FeeStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ParentDashboardPage() {
  const user = await requireRole("parent");
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("parent_student")
    .select("student_id, students(id, full_name, student_code, photo_url, classes(name))")
    .eq("parent_id", user.id);

  const studentIds = links?.map((l) => l.student_id) ?? [];

  const [fees, recentAttendance] = await Promise.all([
    studentIds.length
      ? supabase
          .from("fees")
          .select("id, title, amount, due_date, status, students(full_name)")
          .in("student_id", studentIds)
          .neq("status", "paid")
          .order("due_date", { ascending: true })
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? supabase
          .from("attendance")
          .select("id, date, status, students(full_name)")
          .in("student_id", studentIds)
          .order("date", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
  ]);

  const outstandingTotal =
    fees.data?.reduce((sum, f) => sum + Number(f.amount), 0) ?? 0;

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome, ${user.full_name}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Children" value={links?.length ?? 0} />
        <StatCard label="Outstanding Fees" value={formatCurrency(outstandingTotal)} />
        <StatCard label="Unpaid Fee Records" value={fees.data?.length ?? 0} />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader title="My children" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {links && links.length > 0 ? (
              links.map((l) => (
                <Link
                  key={l.student_id}
                  href={`/parent/children/${l.student_id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.students?.photo_url ?? "/avatar-placeholder.svg"}
                    alt=""
                    className="h-10 w-10 rounded-full bg-slate-200 object-cover"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {l.students?.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {l.students?.student_code} · {l.students?.classes?.name ?? "No class"}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState message="No children linked to your account yet." />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Outstanding fees"
            action={
              <Link href="/parent/fees" className="text-sm text-indigo-600 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            {fees.data && fees.data.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Student</Th>
                    <Th>Fee</Th>
                    <Th>Due</Th>
                    <Th>Status</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {fees.data.map((f) => (
                    <tr key={f.id}>
                      <Td>{f.students?.full_name}</Td>
                      <Td>
                        {f.title} · {formatCurrency(Number(f.amount))}
                      </Td>
                      <Td>{formatDate(f.due_date)}</Td>
                      <Td>
                        <FeeStatusBadge
                          status={
                            f.status !== "paid" && new Date(f.due_date) < new Date()
                              ? "overdue"
                              : f.status
                          }
                        />
                      </Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState message="No outstanding fees." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent attendance"
            action={
              <Link href="/parent/attendance" className="text-sm text-indigo-600 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            {recentAttendance.data && recentAttendance.data.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Student</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {recentAttendance.data.map((a) => (
                    <tr key={a.id}>
                      <Td>{a.students?.full_name}</Td>
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

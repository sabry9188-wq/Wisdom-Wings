import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/storage/student-photos";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { AttendanceBadge, FeeStatusBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ChildProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("parent");
  const { id } = await params;
  const supabase = await createClient();

  // RLS (is_parent_of_student) scopes this to the caller's own children —
  // a parent cannot view another family's student by guessing an id here.
  const { data: student } = await supabase
    .from("students")
    .select("*, classes(name, section)")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const [{ data: attendance }, { data: fees }] = await Promise.all([
    supabase
      .from("attendance")
      .select("id, date, status")
      .eq("student_id", id)
      .order("date", { ascending: false })
      .limit(10),
    supabase
      .from("fees")
      .select("id, title, amount, due_date, status")
      .eq("student_id", id)
      .order("due_date", { ascending: false })
      .limit(10),
  ]);

  const photoUrl = await getSignedPhotoUrl(supabase, student.photo_url);

  return (
    <div>
      <PageHeader title={student.full_name} description={student.student_code} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl ?? "/avatar-placeholder.svg"}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
            />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              {student.full_name}
            </h2>
            <dl className="mt-4 w-full space-y-2 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Class</dt>
                <dd className="text-slate-900">
                  {student.classes
                    ? `${student.classes.name}${student.classes.section ? ` - ${student.classes.section}` : ""}`
                    : "Unassigned"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Date of birth</dt>
                <dd className="text-slate-900">{formatDate(student.date_of_birth)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Gender</dt>
                <dd className="capitalize text-slate-900">{student.gender ?? "—"}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Recent attendance" />
            <CardBody className="p-0">
              {attendance && attendance.length > 0 ? (
                <Table>
                  <Thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Status</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {attendance.map((a) => (
                      <tr key={a.id}>
                        <Td>{formatDate(a.date)}</Td>
                        <Td>
                          <AttendanceBadge status={a.status} />
                        </Td>
                      </tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <EmptyState message="No attendance recorded yet." />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Fees" />
            <CardBody className="p-0">
              {fees && fees.length > 0 ? (
                <Table>
                  <Thead>
                    <tr>
                      <Th>Title</Th>
                      <Th>Amount</Th>
                      <Th>Due</Th>
                      <Th>Status</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {fees.map((f) => (
                      <tr key={f.id}>
                        <Td>{f.title}</Td>
                        <Td>{formatCurrency(Number(f.amount))}</Td>
                        <Td>{formatDate(f.due_date)}</Td>
                        <Td>
                          <FeeStatusBadge status={f.status} />
                        </Td>
                      </tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <EmptyState message="No fees recorded yet." />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

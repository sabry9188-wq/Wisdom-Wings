import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard, Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { SmsStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, GraduationCap, Heart, School, CalendarCheck, Wallet } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    studentsCount,
    teachersCount,
    parentsCount,
    classesCount,
    todayAttendance,
    outstandingFees,
    recentPayments,
    recentSms,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "teacher"),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "parent"),
    supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("attendance").select("status").eq("date", today),
    supabase.from("fees").select("amount, status").neq("status", "paid"),
    supabase
      .from("payments")
      .select("id, amount, receipt_number, paid_at, fees(student_id, students(full_name))")
      .order("paid_at", { ascending: false })
      .limit(5),
    supabase
      .from("sms_logs")
      .select("id, recipient_phone, type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const presentToday =
    todayAttendance.data?.filter((a) => a.status === "present").length ?? 0;
  const absentToday =
    todayAttendance.data?.filter((a) => a.status === "absent").length ?? 0;
  const lateToday =
    todayAttendance.data?.filter((a) => a.status === "late").length ?? 0;
  const totalMarkedToday = todayAttendance.data?.length ?? 0;

  const outstandingTotal =
    outstandingFees.data?.reduce((sum, f) => sum + Number(f.amount), 0) ?? 0;

  return (
    <div>
      <PageHeader title="Dashboard" description="School overview" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={studentsCount.count ?? 0} icon={GraduationCap} tone="indigo" />
        <StatCard label="Total Teachers" value={teachersCount.count ?? 0} icon={Users} tone="sky" />
        <StatCard label="Total Parents" value={parentsCount.count ?? 0} icon={Heart} tone="amber" />
        <StatCard label="Total Classes" value={classesCount.count ?? 0} icon={School} tone="indigo" />
        <StatCard
          label="Today's Attendance"
          value={totalMarkedToday}
          hint={`${presentToday} present · ${absentToday} absent · ${lateToday} late`}
          icon={CalendarCheck}
          tone="green"
        />
        <StatCard
          label="Outstanding Fees"
          value={formatCurrency(outstandingTotal)}
          hint={`${outstandingFees.data?.length ?? 0} unpaid/partial fee records`}
          icon={Wallet}
          tone="red"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent payments"
            action={
              <Link
                href="/admin/payments"
                className="text-sm text-indigo-600 hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            {recentPayments.data && recentPayments.data.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Student</Th>
                    <Th>Receipt</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {recentPayments.data.map((p) => (
                    <tr key={p.id}>
                      <Td>{p.fees?.students?.full_name ?? "—"}</Td>
                      <Td>{p.receipt_number}</Td>
                      <Td>{formatCurrency(Number(p.amount))}</Td>
                      <Td>{formatDate(p.paid_at)}</Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState message="No payments recorded yet." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent SMS activity"
            action={
              <Link
                href="/admin/sms-center"
                className="text-sm text-indigo-600 hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            {recentSms.data && recentSms.data.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Phone</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Sent</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {recentSms.data.map((s) => (
                    <tr key={s.id}>
                      <Td>{s.recipient_phone}</Td>
                      <Td className="capitalize">{s.type.replace("_", " ")}</Td>
                      <Td>
                        <SmsStatusBadge status={s.status} />
                      </Td>
                      <Td>{formatDate(s.created_at)}</Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState message="No SMS activity yet." />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

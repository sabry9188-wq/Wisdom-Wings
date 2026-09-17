import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { SmsStatusBadge } from "@/components/ui/badge";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FeeReminderPanel } from "@/components/sms/fee-reminder-panel";
import { AbsenceAlertPanel } from "@/components/sms/absence-alert-panel";
import { ManualSmsPanel } from "@/components/sms/manual-sms-panel";

export default async function SmsCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ absenceClass?: string; absenceDate?: string }>;
}) {
  await requireRole("admin");
  const { absenceClass, absenceDate } = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const effectiveAbsenceDate = absenceDate || today;

  const [{ data: unpaidFees }, { data: classes }, { data: students }, { data: logs }] =
    await Promise.all([
      supabase
        .from("fees")
        .select("id, title, amount, due_date, students(full_name)")
        .neq("status", "paid")
        .order("due_date"),
      supabase.from("classes").select("id, name, section").eq("is_active", true).order("name"),
      supabase
        .from("students")
        .select("id, full_name, student_code, class_id")
        .eq("is_active", true)
        .order("full_name"),
      supabase
        .from("sms_logs")
        .select("id, recipient_phone, type, status, message, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  let absentStudents: { id: string; full_name: string; student_code: string }[] = [];
  {
    let query = supabase
      .from("attendance")
      .select("students(id, full_name, student_code)")
      .eq("status", "absent")
      .eq("date", effectiveAbsenceDate);
    if (absenceClass) query = query.eq("class_id", absenceClass);
    const { data } = await query;
    absentStudents = (data ?? [])
      .map((r) => r.students)
      .filter((s): s is NonNullable<typeof s> => !!s);
  }

  const unpaidFeeRows = (unpaidFees ?? []).map((f) => ({
    id: f.id,
    title: f.title,
    amount: Number(f.amount),
    due_date: f.due_date,
    student_name: f.students?.full_name ?? "",
  }));

  const manualStudents = (students ?? []).map((s) => ({
    id: s.id,
    full_name: s.full_name,
    student_code: s.student_code,
    class_id: s.class_id,
  }));

  return (
    <div>
      <PageHeader title="SMS Center" description="Fee reminders, absence alerts, and logs" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Fee reminders" />
          <CardBody>
            <FeeReminderPanel fees={unpaidFeeRows} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Absence alerts" />
          <CardBody>
            <form method="GET" className="mb-3 flex gap-2">
              <Select name="absenceClass" defaultValue={absenceClass ?? ""} className="flex-1">
                <option value="">All classes</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.section ? ` - ${c.section}` : ""}
                  </option>
                ))}
              </Select>
              <Input
                type="date"
                name="absenceDate"
                defaultValue={effectiveAbsenceDate}
                className="w-40"
              />
              <Button type="submit" variant="secondary" size="sm">
                Go
              </Button>
            </form>
            <AbsenceAlertPanel students={absentStudents} date={effectiveAbsenceDate} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Manual message" />
          <CardBody>
            <ManualSmsPanel classes={classes ?? []} students={manualStudents} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader title="Recent SMS activity" />
          <CardBody className="p-0">
            {logs && logs.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Phone</Th>
                    <Th>Type</Th>
                    <Th>Message</Th>
                    <Th>Status</Th>
                    <Th>Sent</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <Td>{l.recipient_phone}</Td>
                      <Td className="capitalize">{l.type.replace("_", " ")}</Td>
                      <Td className="max-w-xs truncate" title={l.message}>
                        {l.message}
                      </Td>
                      <Td>
                        <SmsStatusBadge status={l.status} />
                      </Td>
                      <Td>{formatDate(l.created_at)}</Td>
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

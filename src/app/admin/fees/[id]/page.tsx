import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { FeeStatusBadge } from "@/components/ui/badge";
import { RecordPaymentForm } from "@/components/fees/record-payment-form";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function FeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: fee } = await supabase
    .from("fees")
    .select("*, students(id, full_name, student_code), classes(name, section)")
    .eq("id", id)
    .single();

  if (!fee) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, receipt_number, amount, paid_at, method, notes")
    .eq("fee_id", id)
    .order("paid_at", { ascending: false });

  const paidTotal = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const remaining = Math.max(0, Number(fee.amount) - paidTotal);
  const today = new Date().toISOString().slice(0, 10);
  const effectiveStatus = fee.status !== "paid" && fee.due_date < today ? "overdue" : fee.status;

  return (
    <div>
      <PageHeader
        title={fee.title}
        description={
          <Link href={`/admin/students/${fee.students?.id}`} className="text-brand-600 hover:underline">
            {fee.students?.full_name} ({fee.students?.student_code})
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Summary" />
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-medium text-slate-900">{formatCurrency(Number(fee.amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid</span>
              <span className="font-medium text-slate-900">{formatCurrency(paidTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining</span>
              <span className="font-medium text-slate-900">{formatCurrency(remaining)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due date</span>
              <span className="font-medium text-slate-900">{formatDate(fee.due_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <FeeStatusBadge status={effectiveStatus} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Record payment" />
          <CardBody>
            <RecordPaymentForm feeId={id} remaining={remaining} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Payment history" />
          <CardBody className="p-0">
            {payments && payments.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Receipt</Th>
                    <Th>Amount</Th>
                    <Th>Method</Th>
                    <Th>Date</Th>
                    <Th>Notes</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <Td>{p.receipt_number}</Td>
                      <Td>{formatCurrency(Number(p.amount))}</Td>
                      <Td className="capitalize">{p.method.replace("_", " ")}</Td>
                      <Td>{formatDate(p.paid_at)}</Td>
                      <Td>{p.notes ?? "—"}</Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState message="No payments recorded yet." />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ParentPaymentsPage() {
  const user = await requireRole("parent");
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("parent_student")
    .select("student_id")
    .eq("parent_id", user.id);

  const studentIds = links?.map((l) => l.student_id) ?? [];

  const { data: fees } = studentIds.length
    ? await supabase.from("fees").select("id").in("student_id", studentIds)
    : { data: [] };

  const feeIds = fees?.map((f) => f.id) ?? [];

  const { data: payments } = feeIds.length
    ? await supabase
        .from("payments")
        .select("id, receipt_number, amount, paid_at, method, fees(title, students(full_name))")
        .in("fee_id", feeIds)
        .order("paid_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <PageHeader title="Payment History" />

      <Card>
        <CardBody className="p-0">
          {payments && payments.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Receipt</Th>
                  <Th>Child</Th>
                  <Th>Fee</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                </tr>
              </Thead>
              <Tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <Td>{p.receipt_number}</Td>
                    <Td>{p.fees?.students?.full_name}</Td>
                    <Td>{p.fees?.title}</Td>
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
    </div>
  );
}

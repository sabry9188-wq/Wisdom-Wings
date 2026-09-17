import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, StatCard } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { FeeStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Receipt } from "lucide-react";

export default async function ParentFeesPage() {
  const user = await requireRole("parent");
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: links } = await supabase
    .from("parent_student")
    .select("student_id")
    .eq("parent_id", user.id);

  const studentIds = links?.map((l) => l.student_id) ?? [];

  const { data: fees } = studentIds.length
    ? await supabase
        .from("fees")
        .select("id, title, amount, due_date, status, students(full_name)")
        .in("student_id", studentIds)
        .order("due_date", { ascending: false })
    : { data: [] };

  const outstanding = fees?.filter((f) => f.status !== "paid") ?? [];
  const outstandingTotal = outstanding.reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div>
      <PageHeader title="Fees" description="All fee records for your children" />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Outstanding Balance" value={formatCurrency(outstandingTotal)} icon={Wallet} tone="red" />
        <StatCard label="Unpaid/Partial Records" value={outstanding.length} icon={Receipt} tone="amber" />
      </div>

      <Card>
        <CardBody className="p-0">
          {fees && fees.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Child</Th>
                  <Th>Title</Th>
                  <Th>Amount</Th>
                  <Th>Due</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {fees.map((f) => {
                  const effectiveStatus =
                    f.status !== "paid" && f.due_date < today ? "overdue" : f.status;
                  return (
                    <tr key={f.id}>
                      <Td>{f.students?.full_name}</Td>
                      <Td>{f.title}</Td>
                      <Td>{formatCurrency(Number(f.amount))}</Td>
                      <Td>{formatDate(f.due_date)}</Td>
                      <Td>
                        <FeeStatusBadge status={effectiveStatus} />
                      </Td>
                    </tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No fee records yet." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

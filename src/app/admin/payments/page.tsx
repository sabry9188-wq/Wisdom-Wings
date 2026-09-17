import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireRole("admin");
  const { search } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("payments")
    .select("id, receipt_number, amount, paid_at, method, fees(title, students(id, full_name, student_code))")
    .order("paid_at", { ascending: false })
    .limit(200);

  if (search) {
    query = query.ilike("receipt_number", `%${search}%`);
  }

  const { data: payments } = await query;

  return (
    <div>
      <PageHeader title="Payments" description="All recorded payments" />

      <form method="GET" className="mb-4 flex max-w-md gap-2">
        <Input name="search" placeholder="Search by receipt number…" defaultValue={search ?? ""} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        <CardBody className="p-0">
          {payments && payments.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Receipt</Th>
                  <Th>Student</Th>
                  <Th>Fee</Th>
                  <Th>Amount</Th>
                  <Th>Method</Th>
                  <Th>Date</Th>
                </tr>
              </Thead>
              <Tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <Td>{p.receipt_number}</Td>
                    <Td>
                      {p.fees?.students ? (
                        <Link
                          href={`/admin/students/${p.fees.students.id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {p.fees.students.full_name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>{p.fees?.title ?? "—"}</Td>
                    <Td>{formatCurrency(Number(p.amount))}</Td>
                    <Td className="capitalize">{p.method.replace("_", " ")}</Td>
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

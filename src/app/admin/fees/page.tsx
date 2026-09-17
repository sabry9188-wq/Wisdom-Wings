import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, StatCard } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { FeeStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeesFilterBar } from "@/components/fees/fees-filter-bar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FeeStatus } from "@/types/database";
import { Wallet, Receipt } from "lucide-react";

const FEE_STATUSES: FeeStatus[] = ["unpaid", "partially_paid", "paid"];

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; class?: string }>;
}) {
  await requireRole("admin");
  const { status, class: classId } = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("fees")
    .select("id, title, amount, due_date, status, students(full_name, student_code), classes(name, section)")
    .order("due_date", { ascending: false });

  if (classId) query = query.eq("class_id", classId);

  if (status === "overdue") {
    query = query.neq("status", "paid").lt("due_date", today);
  } else if (status && FEE_STATUSES.includes(status as FeeStatus)) {
    query = query.eq("status", status as FeeStatus);
  }

  const [{ data: fees }, { data: classes }, { data: outstanding }] = await Promise.all([
    query,
    supabase.from("classes").select("id, name, section").eq("is_active", true).order("name"),
    supabase.from("fees").select("amount, status").neq("status", "paid"),
  ]);

  const outstandingTotal =
    outstanding?.reduce((sum, f) => sum + Number(f.amount), 0) ?? 0;

  return (
    <div>
      <PageHeader
        title="Fees"
        description="Create and track student fee records"
        action={
          <Link href="/admin/fees/new">
            <Button>Create Fee</Button>
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Outstanding" value={formatCurrency(outstandingTotal)} icon={Wallet} tone="red" />
        <StatCard label="Unpaid/Partial Records" value={outstanding?.length ?? 0} icon={Receipt} tone="amber" />
      </div>

      <FeesFilterBar classes={classes ?? []} />

      <Card>
        <CardBody className="p-0">
          {fees && fees.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Student</Th>
                  <Th>Title</Th>
                  <Th>Amount</Th>
                  <Th>Due</Th>
                  <Th>Status</Th>
                  <Th></Th>
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
                      <Td>
                        <Link
                          href={`/admin/fees/${f.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          View
                        </Link>
                      </Td>
                    </tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No fee records found." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

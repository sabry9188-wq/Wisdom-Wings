import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ParentsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: parents } = await supabase
    .from("users")
    .select("id, full_name, email, phone, is_active, parent_student(count)")
    .eq("role", "parent")
    .order("full_name");

  return (
    <div>
      <PageHeader
        title="Parents"
        description="Manage parent accounts"
        action={
          <Link href="/admin/parents/new">
            <Button>Create Parent</Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="p-0">
          {parents && parents.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Children</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {parents.map((p) => (
                  <tr key={p.id}>
                    <Td>
                      <Link
                        href={`/admin/parents/${p.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {p.full_name}
                      </Link>
                    </Td>
                    <Td>{p.email}</Td>
                    <Td>{p.phone ?? "—"}</Td>
                    <Td>{p.parent_student?.[0]?.count ?? 0}</Td>
                    <Td>
                      <Badge tone={p.is_active ? "green" : "slate"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No parents yet." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

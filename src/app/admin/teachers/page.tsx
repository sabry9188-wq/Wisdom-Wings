import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function TeachersPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("users")
    .select("id, full_name, email, phone, is_active, class_teachers(count)")
    .eq("role", "teacher")
    .order("full_name");

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Manage teacher accounts"
        action={
          <Link href="/admin/teachers/new">
            <Button>Create Teacher</Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="p-0">
          {teachers && teachers.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Classes</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <Td>
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {t.full_name}
                      </Link>
                    </Td>
                    <Td>{t.email}</Td>
                    <Td>{t.phone ?? "—"}</Td>
                    <Td>{t.class_teachers?.[0]?.count ?? 0}</Td>
                    <Td>
                      <Badge tone={t.is_active ? "green" : "slate"}>
                        {t.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No teachers yet." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

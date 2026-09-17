import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ClassesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, section, academic_year, is_active, students(count), class_teachers(count)")
    .order("name");

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Manage classes and assignments"
        action={
          <Link href="/admin/classes/new">
            <Button>Create Class</Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="p-0">
          {classes && classes.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Academic Year</Th>
                  <Th>Students</Th>
                  <Th>Teachers</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <Td>
                      <Link
                        href={`/admin/classes/${c.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {c.name}
                        {c.section ? ` - ${c.section}` : ""}
                      </Link>
                    </Td>
                    <Td>{c.academic_year ?? "—"}</Td>
                    <Td>{c.students?.[0]?.count ?? 0}</Td>
                    <Td>{c.class_teachers?.[0]?.count ?? 0}</Td>
                    <Td>
                      <Badge tone={c.is_active ? "green" : "slate"}>
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No classes yet." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

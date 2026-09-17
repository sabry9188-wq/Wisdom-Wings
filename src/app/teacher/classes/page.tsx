import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";

export default async function TeacherClassesPage() {
  const user = await requireRole("teacher");
  const supabase = await createClient();

  const { data: classRows } = await supabase
    .from("class_teachers")
    .select("classes(id, name, section, academic_year, students(count))")
    .eq("teacher_id", user.id);

  const classes = (classRows ?? [])
    .map((c) => c.classes)
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div>
      <PageHeader title="My Classes" />
      <Card>
        <CardBody className="p-0">
          {classes.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th>Class</Th>
                  <Th>Academic Year</Th>
                  <Th>Students</Th>
                  <Th></Th>
                </tr>
              </Thead>
              <Tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <Td>
                      {c.name}
                      {c.section ? ` - ${c.section}` : ""}
                    </Td>
                    <Td>{c.academic_year ?? "—"}</Td>
                    <Td>{c.students?.[0]?.count ?? 0}</Td>
                    <Td>
                      <Link
                        href={`/teacher/students?class=${c.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        View students
                      </Link>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No classes assigned yet." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

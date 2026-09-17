import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassTeachersAssign } from "@/components/classes/class-teachers-assign";
import { ClassStudentsAssign } from "@/components/classes/class-students-assign";
import { ToggleClassActiveButton } from "@/components/classes/toggle-class-active-button";

export default async function ClassDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: classData } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();

  if (!classData) notFound();

  const [{ data: roster }, { data: assignedTeachers }, { data: allTeachers }, { data: otherStudents }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, student_code, full_name, is_active")
        .eq("class_id", id)
        .order("full_name"),
      supabase.from("class_teachers").select("teacher_id").eq("class_id", id),
      supabase
        .from("users")
        .select("id, full_name")
        .eq("role", "teacher")
        .eq("is_active", true)
        .order("full_name"),
      supabase
        .from("students")
        .select("id, full_name, student_code")
        .eq("is_active", true)
        .or(`class_id.is.null,class_id.neq.${id}`)
        .order("full_name"),
    ]);

  return (
    <div>
      <PageHeader
        title={`${classData.name}${classData.section ? ` - ${classData.section}` : ""}`}
        description={classData.academic_year ?? undefined}
        action={
          <div className="flex gap-2">
            <Link href={`/admin/classes/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <ToggleClassActiveButton classId={id} isActive={classData.is_active} />
          </div>
        }
      />

      <div className="mb-4">
        <Badge tone={classData.is_active ? "green" : "slate"}>
          {classData.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assigned teachers" />
          <CardBody>
            <ClassTeachersAssign
              classId={id}
              allTeachers={allTeachers ?? []}
              assignedTeacherIds={assignedTeachers?.map((t) => t.teacher_id) ?? []}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Assign students" />
          <CardBody>
            <ClassStudentsAssign classId={id} unassignedStudents={otherStudents ?? []} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader title={`Student roster (${roster?.length ?? 0})`} />
          <CardBody className="p-0">
            {roster && roster.length > 0 ? (
              <Table>
                <Thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>Name</Th>
                    <Th>Status</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {roster.map((s) => (
                    <tr key={s.id}>
                      <Td>
                        <Link
                          href={`/admin/students/${s.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {s.student_code}
                        </Link>
                      </Td>
                      <Td>{s.full_name}</Td>
                      <Td>
                        <Badge tone={s.is_active ? "green" : "slate"}>
                          {s.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState message="No students assigned to this class yet." />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

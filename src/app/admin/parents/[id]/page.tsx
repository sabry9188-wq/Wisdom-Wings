import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditUserForm } from "@/components/admin-users/edit-user-form";
import { ToggleUserActiveButton } from "@/components/admin-users/toggle-user-active-button";
import { ParentStudentsAssign } from "@/components/admin-users/parent-students-assign";

export default async function ParentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: parent } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("role", "parent")
    .single();

  if (!parent) notFound();

  const [{ data: allStudents }, { data: linked }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, student_code")
      .eq("is_active", true)
      .order("full_name"),
    supabase.from("parent_student").select("student_id").eq("parent_id", id),
  ]);

  return (
    <div>
      <PageHeader
        title={parent.full_name}
        description="Parent"
        action={
          <ToggleUserActiveButton
            userId={id}
            isActive={parent.is_active}
            listPath="/admin/parents"
          />
        }
      />

      <div className="mb-4">
        <Badge tone={parent.is_active ? "green" : "slate"}>
          {parent.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Details" />
          <CardBody>
            <EditUserForm user={parent} listPath="/admin/parents" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Linked children" />
          <CardBody>
            <ParentStudentsAssign
              parentId={id}
              allStudents={allStudents ?? []}
              linkedStudentIds={linked?.map((l) => l.student_id) ?? []}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

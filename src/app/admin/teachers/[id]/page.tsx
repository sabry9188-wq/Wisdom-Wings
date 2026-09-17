import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditUserForm } from "@/components/admin-users/edit-user-form";
import { ToggleUserActiveButton } from "@/components/admin-users/toggle-user-active-button";
import { TeacherClassesAssign } from "@/components/admin-users/teacher-classes-assign";
import { getSignedProfilePhotoUrl } from "@/lib/storage/profile-photos";

export default async function TeacherDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: teacher } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("role", "teacher")
    .single();

  if (!teacher) notFound();

  const [{ data: allClasses }, { data: assigned }, photoUrl] = await Promise.all([
    supabase.from("classes").select("id, name, section").eq("is_active", true).order("name"),
    supabase.from("class_teachers").select("class_id").eq("teacher_id", id),
    getSignedProfilePhotoUrl(supabase, teacher.photo_url),
  ]);

  return (
    <div>
      <PageHeader
        title={teacher.full_name}
        description="Teacher"
        action={
          <ToggleUserActiveButton
            userId={id}
            isActive={teacher.is_active}
            listPath="/admin/teachers"
          />
        }
      />

      <div className="mb-4">
        <Badge tone={teacher.is_active ? "green" : "slate"}>
          {teacher.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Details" />
          <CardBody>
            <EditUserForm user={teacher} listPath="/admin/teachers" photoUrl={photoUrl} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Assigned classes" />
          <CardBody>
            <TeacherClassesAssign
              teacherId={id}
              allClasses={allClasses ?? []}
              assignedClassIds={assigned?.map((a) => a.class_id) ?? []}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

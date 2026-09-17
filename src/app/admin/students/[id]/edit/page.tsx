import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/storage/student-photos";
import { PageHeader } from "@/components/layout/page-header";
import { StudentForm } from "@/components/students/student-form";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: classes }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase.from("classes").select("id, name, section").eq("is_active", true).order("name"),
  ]);

  if (!student) notFound();

  const photoUrl = await getSignedPhotoUrl(supabase, student.photo_url);

  return (
    <div>
      <PageHeader title="Edit Student" description={student.student_code} />
      <StudentForm
        mode="edit"
        student={student}
        classes={classes ?? []}
        photoUrl={photoUrl}
      />
    </div>
  );
}

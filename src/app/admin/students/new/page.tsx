import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StudentForm } from "@/components/students/student-form";

export default async function NewStudentPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, section")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <PageHeader title="Add Student" description="Register a new student" />
      <StudentForm mode="create" classes={classes ?? []} />
    </div>
  );
}

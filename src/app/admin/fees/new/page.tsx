import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { CreateFeeForm } from "@/components/fees/create-fee-form";

export default async function NewFeePage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: classes }, { data: students }] = await Promise.all([
    supabase.from("classes").select("id, name, section").eq("is_active", true).order("name"),
    supabase
      .from("students")
      .select("id, full_name, student_code")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  return (
    <div>
      <PageHeader title="Create Fee" description="For a whole class or one student" />
      <CreateFeeForm classes={classes ?? []} students={students ?? []} />
    </div>
  );
}

import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ClassForm } from "@/components/classes/class-form";

export default async function NewClassPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "teacher")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div>
      <PageHeader title="Create Class" />
      <ClassForm mode="create" teachers={teachers ?? []} />
    </div>
  );
}

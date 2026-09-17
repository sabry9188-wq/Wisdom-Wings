import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ClassForm } from "@/components/classes/class-form";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: classData } = await supabase.from("classes").select("*").eq("id", id).single();

  if (!classData) notFound();

  return (
    <div>
      <PageHeader title="Edit Class" />
      <ClassForm mode="edit" classData={classData} />
    </div>
  );
}

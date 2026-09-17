import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/layout/page-header";
import { ClassForm } from "@/components/classes/class-form";

export default async function NewClassPage() {
  await requireRole("admin");

  return (
    <div>
      <PageHeader title="Create Class" />
      <ClassForm mode="create" />
    </div>
  );
}

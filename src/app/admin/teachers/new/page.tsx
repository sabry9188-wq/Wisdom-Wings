import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/layout/page-header";
import { CreateUserForm } from "@/components/admin-users/create-user-form";

export default async function NewTeacherPage() {
  await requireRole("admin");

  return (
    <div>
      <PageHeader title="Create Teacher" description="Teachers cannot self-register" />
      <CreateUserForm role="teacher" />
    </div>
  );
}

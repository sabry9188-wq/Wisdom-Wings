import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/layout/page-header";
import { CreateUserForm } from "@/components/admin-users/create-user-form";

export default async function NewParentPage() {
  await requireRole("admin");

  return (
    <div>
      <PageHeader title="Create Parent" description="Parents cannot self-register" />
      <CreateUserForm role="parent" />
    </div>
  );
}

import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ParentProfilePage() {
  const user = await requireRole("parent");

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account details" />
      <ProfileForm user={user} />
    </div>
  );
}

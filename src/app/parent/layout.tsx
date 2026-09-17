import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("parent");

  return (
    <DashboardShell role="parent" userName={user.full_name}>
      {children}
    </DashboardShell>
  );
}

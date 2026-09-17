import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("admin");

  return (
    <DashboardShell role="admin" userName={user.full_name}>
      {children}
    </DashboardShell>
  );
}

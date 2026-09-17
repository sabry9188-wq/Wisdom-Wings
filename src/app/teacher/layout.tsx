import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("teacher");

  return (
    <DashboardShell role="teacher" userName={user.full_name}>
      {children}
    </DashboardShell>
  );
}

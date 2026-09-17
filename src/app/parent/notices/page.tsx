import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  fee_reminder: "Fee reminder",
  absence_alert: "Absence alert",
  manual: "Notice",
};

export default async function ParentNoticesPage() {
  const user = await requireRole("parent");
  const supabase = await createClient();

  const { data: notices } = await supabase
    .from("sms_logs")
    .select("id, type, message, created_at")
    .eq("recipient_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader title="Notices" description="Messages sent to you by the school" />

      {notices && notices.length > 0 ? (
        <div className="space-y-3">
          {notices.map((n) => (
            <Card key={n.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(n.created_at)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{n.message}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <EmptyState message="No notices yet." />
          </CardBody>
        </Card>
      )}
    </div>
  );
}

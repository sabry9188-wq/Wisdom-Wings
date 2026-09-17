import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AttendanceWindowForm } from "@/components/settings/attendance-window-form";

export default async function SettingsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: setting } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "attendance_edit_window_hours")
    .single();

  return (
    <div>
      <PageHeader title="Settings" description="System configuration" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Attendance" />
          <CardBody>
            <AttendanceWindowForm currentHours={setting?.value ?? "24"} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="SMS provider" />
          <CardBody>
            <p className="text-sm text-slate-600">
              Active provider: <span className="font-medium">{process.env.SMS_PROVIDER ?? "console"}</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              The console provider logs messages on the server instead of
              sending real SMS. To connect a real gateway, add a provider file
              under src/lib/sms/providers and set SMS_PROVIDER in your
              environment — see the README.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

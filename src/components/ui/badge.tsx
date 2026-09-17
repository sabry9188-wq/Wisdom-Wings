import { cn } from "@/lib/utils";

type Tone = "green" | "red" | "amber" | "slate" | "blue";

const toneClasses: Record<Tone, string> = {
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-800",
};

export function Badge({ tone = "slate", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

const ATTENDANCE_TONE: Record<string, Tone> = {
  present: "green",
  absent: "red",
  late: "amber",
};

export function AttendanceBadge({ status }: { status: string }) {
  return (
    <Badge tone={ATTENDANCE_TONE[status] ?? "slate"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

const FEE_TONE: Record<string, Tone> = {
  paid: "green",
  unpaid: "red",
  partially_paid: "amber",
  overdue: "red",
};

const FEE_LABEL: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  partially_paid: "Partially Paid",
  overdue: "Overdue",
};

export function FeeStatusBadge({ status }: { status: string }) {
  return <Badge tone={FEE_TONE[status] ?? "slate"}>{FEE_LABEL[status] ?? status}</Badge>;
}

const SMS_TONE: Record<string, Tone> = {
  sent: "blue",
  delivered: "green",
  failed: "red",
  queued: "slate",
};

export function SmsStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={SMS_TONE[status] ?? "slate"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

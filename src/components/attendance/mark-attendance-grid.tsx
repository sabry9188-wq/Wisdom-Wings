"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAttendanceAction } from "@/app/teacher/attendance/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/database";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; activeClass: string }[] = [
  { value: "present", label: "Present", activeClass: "bg-green-600 text-white" },
  { value: "late", label: "Late", activeClass: "bg-amber-500 text-white" },
  { value: "absent", label: "Absent", activeClass: "bg-red-600 text-white" },
];

export function MarkAttendanceGrid({
  classId,
  date,
  students,
  existing,
}: {
  classId: string;
  date: string;
  students: { id: string; full_name: string; student_code: string }[];
  existing: Record<string, AttendanceStatus>;
}) {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    for (const s of students) {
      initial[s.id] = existing[s.id] ?? "present";
    }
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setAll(status: AttendanceStatus) {
    setStatuses((prev) => {
      const next = { ...prev };
      for (const s of students) next[s.id] = status;
      return next;
    });
  }

  function onSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const records = students.map((s) => ({
        student_id: s.id,
        status: statuses[s.id],
      }));
      const result = await markAttendanceAction(classId, date, records);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  if (students.length === 0) {
    return <p className="text-sm text-slate-500">No active students in this class.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="text-sm text-slate-500 self-center">Mark all:</span>
        <Button size="sm" variant="secondary" onClick={() => setAll("present")}>
          All present
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setAll("absent")}>
          All absent
        </Button>
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{s.full_name}</p>
              <p className="text-xs text-slate-500">{s.student_code}</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setStatuses((prev) => ({ ...prev, [s.id]: opt.value }))
                  }
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    statuses[s.id] === opt.value
                      ? opt.activeClass
                      : "text-slate-600 hover:bg-white",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="mt-3 text-sm text-green-600">Attendance saved.</p> : null}

      <Button className="mt-4" onClick={onSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save attendance"}
      </Button>
    </div>
  );
}

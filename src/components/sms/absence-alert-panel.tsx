"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AbsentStudent {
  id: string;
  full_name: string;
  student_code: string;
}

export function AbsenceAlertPanel({
  students,
  date,
}: {
  students: AbsentStudent[];
  date: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(students.map((s) => s.id)),
  );
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSend() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "absence_alert",
          studentIds: [...selected],
          date,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Failed to send alerts.");
        return;
      }
      setResult(`Sent ${body.sent}/${body.total} alert(s).`);
      router.refresh();
    });
  }

  if (students.length === 0) {
    return <p className="text-sm text-slate-500">No absences recorded for this date.</p>;
  }

  return (
    <div>
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {students.map((s) => (
          <label
            key={s.id}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selected.has(s.id)}
              onChange={() => toggle(s.id)}
              className="rounded border-slate-300"
            />
            {s.full_name} ({s.student_code})
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {result ? <p className="mt-2 text-sm text-green-600">{result}</p> : null}
      <Button
        className="mt-3"
        size="sm"
        onClick={onSend}
        disabled={isPending || selected.size === 0}
      >
        {isPending ? "Sending…" : `Send absence alerts (${selected.size})`}
      </Button>
    </div>
  );
}

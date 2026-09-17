"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";

interface StudentOption {
  id: string;
  full_name: string;
  student_code: string;
  class_id: string | null;
}

export function ManualSmsPanel({
  classes,
  students,
}: {
  classes: { id: string; name: string; section: string | null }[];
  students: StudentOption[];
}) {
  const router = useRouter();
  const [classFilter, setClassFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleStudents = useMemo(
    () => (classFilter ? students.filter((s) => s.class_id === classFilter) : students),
    [students, classFilter],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(visibleStudents.map((s) => s.id)));
  }

  function onSend() {
    setError(null);
    setResult(null);
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "manual", studentIds: [...selected], message }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Failed to send message.");
        return;
      }
      setResult(`Sent ${body.sent}/${body.total} message(s).`);
      setSelected(new Set());
      setMessage("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
        <option value="">All classes</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.section ? ` - ${c.section}` : ""}
          </option>
        ))}
      </Select>

      <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-2">
        {visibleStudents.length > 0 ? (
          visibleStudents.map((s) => (
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
          ))
        ) : (
          <p className="px-2 py-1 text-sm text-slate-500">No students found.</p>
        )}
      </div>

      <Button type="button" size="sm" variant="secondary" onClick={selectAllVisible}>
        Select all shown ({visibleStudents.length})
      </Button>

      <Textarea
        rows={3}
        placeholder="Message to send…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {result ? <p className="text-sm text-green-600">{result}</p> : null}

      <Button onClick={onSend} disabled={isPending || selected.size === 0}>
        {isPending ? "Sending…" : `Send message (${selected.size})`}
      </Button>
    </div>
  );
}

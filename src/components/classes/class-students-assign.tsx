"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignStudentsToClassAction } from "@/app/admin/classes/actions";
import { Button } from "@/components/ui/button";

export function ClassStudentsAssign({
  classId,
  unassignedStudents,
}: {
  classId: string;
  unassignedStudents: { id: string; full_name: string; student_code: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onAssign() {
    setError(null);
    startTransition(async () => {
      const result = await assignStudentsToClassAction(classId, [...selected]);
      if (result?.error) setError(result.error);
      else {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  if (unassignedStudents.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No unassigned or other-class students available to add.
      </p>
    );
  }

  return (
    <div>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {unassignedStudents.map((s) => (
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
      <Button
        className="mt-3"
        size="sm"
        onClick={onAssign}
        disabled={isPending || selected.size === 0}
      >
        {isPending ? "Assigning…" : "Assign selected to this class"}
      </Button>
    </div>
  );
}

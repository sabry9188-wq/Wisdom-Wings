"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncParentStudentsAction } from "@/app/admin/parents/actions";
import { Button } from "@/components/ui/button";

export function ParentStudentsAssign({
  parentId,
  allStudents,
  linkedStudentIds,
}: {
  parentId: string;
  allStudents: { id: string; full_name: string; student_code: string }[];
  linkedStudentIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(linkedStudentIds));
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

  function onSave() {
    setError(null);
    startTransition(async () => {
      const result = await syncParentStudentsAction(parentId, [...selected]);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  if (allStudents.length === 0) {
    return <p className="text-sm text-slate-500">No students available yet.</p>;
  }

  return (
    <div>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {allStudents.map((s) => (
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
      <Button className="mt-3" size="sm" onClick={onSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save linked children"}
      </Button>
    </div>
  );
}

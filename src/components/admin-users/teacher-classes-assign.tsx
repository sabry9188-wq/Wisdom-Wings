"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncTeacherClassesAction } from "@/app/admin/classes/actions";
import { Button } from "@/components/ui/button";

export function TeacherClassesAssign({
  teacherId,
  allClasses,
  assignedClassIds,
}: {
  teacherId: string;
  allClasses: { id: string; name: string; section: string | null }[];
  assignedClassIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedClassIds));
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
      const result = await syncTeacherClassesAction(teacherId, [...selected]);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  if (allClasses.length === 0) {
    return <p className="text-sm text-slate-500">No classes created yet.</p>;
  }

  return (
    <div>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {allClasses.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selected.has(c.id)}
              onChange={() => toggle(c.id)}
              className="rounded border-slate-300"
            />
            {c.name}
            {c.section ? ` - ${c.section}` : ""}
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <Button className="mt-3" size="sm" onClick={onSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save class assignments"}
      </Button>
    </div>
  );
}

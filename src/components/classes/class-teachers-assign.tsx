"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncClassTeachersAction } from "@/app/admin/classes/actions";
import { Button } from "@/components/ui/button";

export function ClassTeachersAssign({
  classId,
  allTeachers,
  assignedTeacherIds,
}: {
  classId: string;
  allTeachers: { id: string; full_name: string }[];
  assignedTeacherIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(assignedTeacherIds),
  );
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
      const result = await syncClassTeachersAction(classId, [...selected]);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  if (allTeachers.length === 0) {
    return <p className="text-sm text-slate-500">No teachers available yet.</p>;
  }

  return (
    <div>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {allTeachers.map((t) => (
          <label
            key={t.id}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selected.has(t.id)}
              onChange={() => toggle(t.id)}
              className="rounded border-slate-300"
            />
            {t.full_name}
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <Button className="mt-3" size="sm" onClick={onSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save teacher assignments"}
      </Button>
    </div>
  );
}

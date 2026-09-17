"use client";

import { useState, useTransition } from "react";
import { createClassAction, updateClassAction } from "@/app/admin/classes/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/input";
import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
type TeacherOption = { id: string; full_name: string };

const GRADE_OPTIONS = Array.from({ length: 13 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `Grade ${n}`;
});

function SectionField({ defaultValue }: { defaultValue?: string }) {
  const isKnownGrade = !defaultValue || GRADE_OPTIONS.includes(defaultValue);
  const [useOther, setUseOther] = useState(!isKnownGrade);

  return (
    <FormField label="Section" htmlFor="section">
      <Select
        id="section"
        name={useOther ? undefined : "section"}
        defaultValue={isKnownGrade ? (defaultValue ?? "") : "__other__"}
        onChange={(e) => setUseOther(e.target.value === "__other__")}
      >
        <option value="">Select a grade…</option>
        {GRADE_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
        <option value="__other__">Other…</option>
      </Select>
      {useOther ? (
        <Input
          name="section"
          className="mt-2"
          placeholder="e.g. Grade 06 - A"
          defaultValue={!isKnownGrade ? defaultValue : ""}
        />
      ) : null}
    </FormField>
  );
}

export function ClassForm({
  mode,
  classData,
  teachers = [],
}: {
  mode: "create" | "edit";
  classData?: ClassRow;
  teachers?: TeacherOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());

  function toggleTeacher(id: string) {
    setSelectedTeachers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(formData: FormData) {
    setError(null);
    for (const id of selectedTeachers) {
      formData.append("teacher_ids", id);
    }
    startTransition(async () => {
      const action = mode === "create" ? createClassAction : updateClassAction;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="max-w-lg space-y-4">
      {classData ? <input type="hidden" name="id" value={classData.id} /> : null}

      <FormField label="Class name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={classData?.name} />
      </FormField>

      <SectionField defaultValue={classData?.section ?? undefined} />

      <FormField label="Academic year" htmlFor="academic_year">
        <Input
          id="academic_year"
          name="academic_year"
          placeholder="2026"
          defaultValue={classData?.academic_year ?? ""}
        />
      </FormField>

      {mode === "create" ? (
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Class teacher(s)
          </span>
          {teachers.length > 0 ? (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {teachers.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeachers.has(t.id)}
                    onChange={() => toggleTeacher(t.id)}
                    className="rounded border-slate-300"
                  />
                  {t.full_name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No teachers yet — you can assign one later from the class page.
            </p>
          )}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : mode === "create" ? "Create class" : "Save changes"}
      </Button>
    </form>
  );
}

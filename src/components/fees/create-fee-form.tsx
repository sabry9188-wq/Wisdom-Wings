"use client";

import { useState, useTransition } from "react";
import { createFeeAction } from "@/app/admin/fees/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/input";

export function CreateFeeForm({
  classes,
  students,
}: {
  classes: { id: string; name: string; section: string | null }[];
  students: { id: string; full_name: string; student_code: string }[];
}) {
  const [target, setTarget] = useState<"class" | "student">("class");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createFeeAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="max-w-lg space-y-4">
      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">Apply to</span>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="target"
              value="class"
              checked={target === "class"}
              onChange={() => setTarget("class")}
            />
            Entire class
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="target"
              value="student"
              checked={target === "student"}
              onChange={() => setTarget("student")}
            />
            Individual student
          </label>
        </div>
      </div>

      {target === "class" ? (
        <FormField label="Class" htmlFor="class_id">
          <Select id="class_id" name="class_id" required>
            <option value="">Select a class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.section ? ` - ${c.section}` : ""}
              </option>
            ))}
          </Select>
        </FormField>
      ) : (
        <FormField label="Student" htmlFor="student_id">
          <Select id="student_id" name="student_id" required>
            <option value="">Select a student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.student_code})
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <FormField label="Title" htmlFor="title">
        <Input id="title" name="title" required placeholder="e.g. September 2026 Tuition" />
      </FormField>
      <FormField label="Amount" htmlFor="amount">
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
      </FormField>
      <FormField label="Due date" htmlFor="due_date">
        <Input id="due_date" name="due_date" type="date" required />
      </FormField>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create fee"}
      </Button>
    </form>
  );
}

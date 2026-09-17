"use client";

import { useState, useTransition } from "react";
import { createClassAction, updateClassAction } from "@/app/admin/classes/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];

export function ClassForm({
  mode,
  classData,
}: {
  mode: "create" | "edit";
  classData?: ClassRow;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
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
      <FormField label="Section" htmlFor="section">
        <Input id="section" name="section" defaultValue={classData?.section ?? ""} />
      </FormField>
      <FormField label="Academic year" htmlFor="academic_year">
        <Input
          id="academic_year"
          name="academic_year"
          placeholder="2026"
          defaultValue={classData?.academic_year ?? ""}
        />
      </FormField>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : mode === "create" ? "Create class" : "Save changes"}
      </Button>
    </form>
  );
}

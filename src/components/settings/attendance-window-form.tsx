"use client";

import { useState, useTransition } from "react";
import { updateAttendanceEditWindowAction } from "@/app/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";

export function AttendanceWindowForm({ currentHours }: { currentHours: string }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateAttendanceEditWindowAction(formData);
      if (result?.error) setError(result.error);
      else setMessage("Saved.");
    });
  }

  return (
    <form action={onSubmit} className="max-w-xs space-y-4">
      <FormField
        label="Attendance edit window (hours)"
        htmlFor="attendance_edit_window_hours"
      >
        <Input
          id="attendance_edit_window_hours"
          name="attendance_edit_window_hours"
          type="number"
          min={0}
          step={1}
          defaultValue={currentHours}
          required
        />
      </FormField>
      <p className="text-xs text-slate-500">
        Teachers can edit an attendance record for this many hours after it was
        first marked. Admins are never restricted by this window.
      </p>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

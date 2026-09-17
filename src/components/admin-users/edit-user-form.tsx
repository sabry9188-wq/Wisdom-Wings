"use client";

import { useState, useTransition } from "react";
import { updateUserProfileAction } from "@/lib/auth/admin-user-actions";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import type { CurrentUser } from "@/lib/auth/session";

export function EditUserForm({
  user,
  listPath,
}: {
  user: CurrentUser;
  listPath: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateUserProfileAction(user.id, listPath, formData);
      if (result?.error) setError(result.error);
      else setMessage("Saved.");
    });
  }

  return (
    <form action={onSubmit} className="max-w-md space-y-4">
      <FormField label="Full name" htmlFor="full_name">
        <Input id="full_name" name="full_name" required defaultValue={user.full_name} />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" value={user.email ?? ""} disabled />
      </FormField>
      <FormField label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
      </FormField>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPaymentAction } from "@/app/admin/fees/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/input";

export function RecordPaymentForm({
  feeId,
  remaining,
}: {
  feeId: string;
  remaining: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await recordPaymentAction(formData);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  if (remaining <= 0) {
    return <p className="text-sm text-green-700">This fee is fully paid.</p>;
  }

  return (
    <form action={onSubmit} className="max-w-sm space-y-4">
      <input type="hidden" name="fee_id" value={feeId} />
      <FormField label={`Amount (remaining: ${remaining.toFixed(2)})`} htmlFor="amount">
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={remaining}
          defaultValue={remaining.toFixed(2)}
          required
        />
      </FormField>
      <FormField label="Method" htmlFor="method">
        <Select id="method" name="method" defaultValue="cash">
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </Select>
      </FormField>
      <FormField label="Notes (optional)" htmlFor="notes">
        <Input id="notes" name="notes" />
      </FormField>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Recording…" : "Record payment"}
      </Button>
    </form>
  );
}

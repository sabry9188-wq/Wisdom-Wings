"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

interface UnpaidFee {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  student_name: string;
}

export function FeeReminderPanel({ fees }: { fees: UnpaidFee[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSend() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "fee_reminder", feeIds: [...selected] }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Failed to send reminders.");
        return;
      }
      setResult(`Sent ${body.sent}/${body.total} reminder(s).`);
      setSelected(new Set());
      router.refresh();
    });
  }

  if (fees.length === 0) {
    return <p className="text-sm text-slate-500">No unpaid fees right now.</p>;
  }

  return (
    <div>
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {fees.map((f) => (
          <label
            key={f.id}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.has(f.id)}
                onChange={() => toggle(f.id)}
                className="rounded border-slate-300"
              />
              {f.student_name} — {f.title}
            </span>
            <span className="text-slate-500">
              {formatCurrency(f.amount)} · due {formatDate(f.due_date)}
            </span>
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {result ? <p className="mt-2 text-sm text-green-600">{result}</p> : null}
      <Button
        className="mt-3"
        size="sm"
        onClick={onSend}
        disabled={isPending || selected.size === 0}
      >
        {isPending ? "Sending…" : `Send reminders (${selected.size})`}
      </Button>
    </div>
  );
}

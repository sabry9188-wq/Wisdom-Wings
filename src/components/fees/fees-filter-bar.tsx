"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/input";

export function FeesFilterBar({
  classes,
}: {
  classes: { id: string; name: string; section: string | null }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="unpaid">Unpaid</option>
        <option value="partially_paid">Partially Paid</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
      </Select>
      <Select
        defaultValue={searchParams.get("class") ?? ""}
        onChange={(e) => update("class", e.target.value)}
      >
        <option value="">All classes</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.section ? ` - ${c.section}` : ""}
          </option>
        ))}
      </Select>
    </div>
  );
}

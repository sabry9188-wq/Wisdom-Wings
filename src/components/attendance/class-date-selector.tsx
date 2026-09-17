"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, Input } from "@/components/ui/input";

export function ClassDateSelector({
  classes,
  selectedClassId,
  selectedDate,
}: {
  classes: { id: string; name: string; section: string | null }[];
  selectedClassId: string;
  selectedDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
      <Select
        value={selectedClassId}
        onChange={(e) => update("class", e.target.value)}
      >
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.section ? ` - ${c.section}` : ""}
          </option>
        ))}
      </Select>
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => update("date", e.target.value)}
      />
    </div>
  );
}

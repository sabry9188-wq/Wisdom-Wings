"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AttendanceReportFilterBar({
  classes,
}: {
  classes: { id: string; name: string; section: string | null }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (value) params.set(key, String(value));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
      <Select name="class" defaultValue={searchParams.get("class") ?? ""}>
        <option value="">All classes</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.section ? ` - ${c.section}` : ""}
          </option>
        ))}
      </Select>
      <Input type="date" name="from" defaultValue={searchParams.get("from") ?? ""} />
      <Input type="date" name="to" defaultValue={searchParams.get("to") ?? ""} />
      <Button type="submit" variant="secondary">
        Apply filters
      </Button>
    </form>
  );
}

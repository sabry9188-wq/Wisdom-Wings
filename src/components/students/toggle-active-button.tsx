"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleStudentActiveAction } from "@/app/admin/students/actions";
import { Button } from "@/components/ui/button";

export function ToggleActiveButton({
  studentId,
  isActive,
}: {
  studentId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await toggleStudentActiveAction(studentId, !isActive);
      router.refresh();
    });
  }

  return (
    <Button variant={isActive ? "danger" : "secondary"} onClick={onClick} disabled={isPending}>
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}

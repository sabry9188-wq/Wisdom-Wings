"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleClassActiveAction } from "@/app/admin/classes/actions";
import { Button } from "@/components/ui/button";

export function ToggleClassActiveButton({
  classId,
  isActive,
}: {
  classId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await toggleClassActiveAction(classId, !isActive);
      router.refresh();
    });
  }

  return (
    <Button variant={isActive ? "danger" : "secondary"} onClick={onClick} disabled={isPending}>
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}

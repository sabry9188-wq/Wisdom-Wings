"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleUserActiveAction } from "@/lib/auth/admin-user-actions";
import { Button } from "@/components/ui/button";

export function ToggleUserActiveButton({
  userId,
  isActive,
  listPath,
}: {
  userId: string;
  isActive: boolean;
  listPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await toggleUserActiveAction(userId, !isActive, listPath);
      router.refresh();
    });
  }

  return (
    <Button variant={isActive ? "danger" : "secondary"} onClick={onClick} disabled={isPending}>
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}

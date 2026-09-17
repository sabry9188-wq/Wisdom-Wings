import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-600/30">
        <GraduationCap className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {!iconOnly ? (
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Wisdom Wings
        </span>
      ) : null}
    </span>
  );
}

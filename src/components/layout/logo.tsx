import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo-icon-64.png"
        alt="Wisdom Wings"
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-lg"
        priority
      />
      {!iconOnly ? (
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Wisdom Wings
        </span>
      ) : null}
    </span>
  );
}

/** Full brand lockup (icon + wordmark + tagline) for hero/auth moments. */
export function LogoFull({ className, width = 220 }: { className?: string; width?: number }) {
  return (
    <Image
      src="/logo-full.png"
      alt="Wisdom Wings — To Fly High"
      width={900}
      height={600}
      style={{ width, height: "auto" }}
      className={className}
      priority
    />
  );
}

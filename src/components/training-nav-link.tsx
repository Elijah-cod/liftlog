"use client";

import type { LucideIcon } from "lucide-react";
import Link, { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

interface TrainingNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  variant: "sidebar" | "mobile";
}

function NavigationPendingDot({ variant }: { variant: TrainingNavLinkProps["variant"] }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 shrink-0 rounded-full bg-current opacity-0 transition-opacity duration-150",
        variant === "sidebar" ? "ml-auto" : "absolute right-2 top-2",
        pending && "opacity-60",
      )}
    />
  );
}

export function TrainingNavLink({ href, label, icon: Icon, active, variant }: TrainingNavLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative font-semibold transition-colors active:scale-[0.98]",
        variant === "sidebar"
          ? "flex min-h-11 items-center gap-3 rounded-[16px] px-3 text-sm"
          : "flex min-h-14 flex-col items-center justify-center gap-1 rounded-[14px] px-1 text-[10px]",
        active
          ? "bg-slate-950 text-white shadow-sm"
          : variant === "sidebar"
            ? "text-slate-600 hover:bg-white hover:text-slate-950"
            : "border border-slate-200 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-950",
      )}
    >
      <Icon className={variant === "sidebar" ? "size-4" : "size-[18px]"} />
      <span className="whitespace-nowrap">{label}</span>
      <NavigationPendingDot variant={variant} />
    </Link>
  );
}

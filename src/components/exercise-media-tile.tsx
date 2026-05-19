import Image from "next/image";
import { Activity, Dumbbell, Timer } from "lucide-react";

import type { LoadType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ExerciseMediaTileProps {
  name: string;
  mediaPath: string;
  loadType: LoadType;
  className?: string;
}

function getAccentClasses(loadType: LoadType) {
  switch (loadType) {
    case "weighted":
      return {
        shell:
          "border-sky-200/80 bg-[linear-gradient(135deg,#eff6ff,#dbeafe_55%,#f5d0fe)]",
        iconBg: "bg-[linear-gradient(135deg,#2563eb,#0ea5e9)] text-white",
      };
    case "bodyweight":
      return {
        shell:
          "border-emerald-200/80 bg-[linear-gradient(135deg,#ecfdf5,#d1fae5_55%,#fef3c7)]",
        iconBg: "bg-[linear-gradient(135deg,#10b981,#22c55e)] text-white",
      };
    case "timed":
      return {
        shell:
          "border-amber-200/80 bg-[linear-gradient(135deg,#fff7ed,#fde68a_55%,#fed7aa)]",
        iconBg: "bg-[linear-gradient(135deg,#f59e0b,#f97316)] text-white",
      };
  }
}

function getIcon(loadType: LoadType) {
  switch (loadType) {
    case "weighted":
      return <Dumbbell className="size-3.5" />;
    case "bodyweight":
      return <Activity className="size-3.5" />;
    case "timed":
      return <Timer className="size-3.5" />;
  }
}

export function ExerciseMediaTile({
  name,
  mediaPath,
  loadType,
  className,
}: ExerciseMediaTileProps) {
  const accent = getAccentClasses(loadType);
  const icon = getIcon(loadType);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border p-1.5 shadow-sm",
        accent.shell,
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-white/90">
        <Image
          src={mediaPath}
          alt={name}
          fill
          sizes="(max-width: 640px) 64px, 72px"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_42%)]" />
        <div
          className={cn(
            "absolute bottom-1.5 right-1.5 flex size-7 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(15,23,42,0.18)]",
            accent.iconBg,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

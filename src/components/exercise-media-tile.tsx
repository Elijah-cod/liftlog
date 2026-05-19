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

type ExerciseCategory = "push" | "pull" | "legs" | "core" | "arms" | "conditioning";

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

function getExerciseCategory(name: string, loadType: LoadType): ExerciseCategory {
  const value = name.toLowerCase();

  if (
    value.includes("squat") ||
    value.includes("lunge") ||
    value.includes("deadlift") ||
    value.includes("leg") ||
    value.includes("calf")
  ) {
    return "legs";
  }

  if (
    value.includes("pulldown") ||
    value.includes("row") ||
    value.includes("face pull") ||
    value.includes("reverse fly")
  ) {
    return "pull";
  }

  if (
    value.includes("curl") ||
    value.includes("extension") ||
    value.includes("tricep") ||
    value.includes("bicep")
  ) {
    return "arms";
  }

  if (
    value.includes("plank") ||
    value.includes("crunch") ||
    value.includes("sit up") ||
    value.includes("dead bug")
  ) {
    return "core";
  }

  if (loadType === "timed") {
    return "conditioning";
  }

  return "push";
}

function getCategoryMeta(category: ExerciseCategory) {
  switch (category) {
    case "push":
      return {
        label: "Push",
        panel:
          "bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(191,219,254,0.9)_55%,rgba(245,208,254,0.75))]",
        haloA: "bg-sky-300/60",
        haloB: "bg-fuchsia-300/50",
        stripe: "from-sky-500/10 via-white/0 to-fuchsia-500/10",
        text: "text-sky-950",
        chip: "border-sky-200 bg-white/80 text-sky-700",
      };
    case "pull":
      return {
        label: "Pull",
        panel:
          "bg-[linear-gradient(135deg,rgba(240,253,250,0.96),rgba(167,243,208,0.88)_55%,rgba(191,219,254,0.72))]",
        haloA: "bg-emerald-300/55",
        haloB: "bg-cyan-300/45",
        stripe: "from-emerald-500/10 via-white/0 to-cyan-500/10",
        text: "text-emerald-950",
        chip: "border-emerald-200 bg-white/80 text-emerald-700",
      };
    case "legs":
      return {
        label: "Legs",
        panel:
          "bg-[linear-gradient(135deg,rgba(255,247,237,0.98),rgba(253,230,138,0.78)_52%,rgba(252,165,165,0.65))]",
        haloA: "bg-amber-300/55",
        haloB: "bg-rose-300/45",
        stripe: "from-amber-500/10 via-white/0 to-rose-500/10",
        text: "text-amber-950",
        chip: "border-amber-200 bg-white/80 text-amber-700",
      };
    case "core":
      return {
        label: "Core",
        panel:
          "bg-[linear-gradient(135deg,rgba(245,243,255,0.98),rgba(221,214,254,0.82)_52%,rgba(196,181,253,0.7))]",
        haloA: "bg-violet-300/55",
        haloB: "bg-fuchsia-300/40",
        stripe: "from-violet-500/10 via-white/0 to-fuchsia-500/10",
        text: "text-violet-950",
        chip: "border-violet-200 bg-white/80 text-violet-700",
      };
    case "arms":
      return {
        label: "Arms",
        panel:
          "bg-[linear-gradient(135deg,rgba(253,244,255,0.98),rgba(245,208,254,0.82)_52%,rgba(186,230,253,0.65))]",
        haloA: "bg-fuchsia-300/55",
        haloB: "bg-sky-300/45",
        stripe: "from-fuchsia-500/10 via-white/0 to-sky-500/10",
        text: "text-fuchsia-950",
        chip: "border-fuchsia-200 bg-white/80 text-fuchsia-700",
      };
    case "conditioning":
      return {
        label: "Timed",
        panel:
          "bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(253,230,138,0.82)_52%,rgba(134,239,172,0.55))]",
        haloA: "bg-amber-300/55",
        haloB: "bg-lime-300/40",
        stripe: "from-amber-500/10 via-white/0 to-lime-500/10",
        text: "text-amber-950",
        chip: "border-amber-200 bg-white/80 text-amber-700",
      };
  }
}

function getShortName(name: string) {
  return name
    .replace(/\(.*?\)/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

export function ExerciseMediaTile({
  name,
  mediaPath,
  loadType,
  className,
}: ExerciseMediaTileProps) {
  const accent = getAccentClasses(loadType);
  const icon = getIcon(loadType);
  const isPlaceholder = mediaPath === "/media/exercise-placeholder.svg";
  const category = getExerciseCategory(name, loadType);
  const categoryMeta = getCategoryMeta(category);
  const shortName = getShortName(name);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border p-1.5 shadow-sm",
        accent.shell,
        className,
      )}
    >
      {isPlaceholder ? (
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-[16px]",
            categoryMeta.panel,
          )}
        >
          <div className={cn("absolute -left-3 top-2 h-10 w-10 rounded-full blur-xl", categoryMeta.haloA)} />
          <div className={cn("absolute -right-2 bottom-3 h-12 w-12 rounded-full blur-xl", categoryMeta.haloB)} />
          <div className={cn("absolute inset-0 bg-gradient-to-br", categoryMeta.stripe)} />
          <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
          <div className="relative flex h-full flex-col justify-between p-2">
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm",
                  categoryMeta.chip,
                )}
              >
                {categoryMeta.label}
              </span>
            </div>
            <div className="pr-6">
              <p className={cn("text-[11px] font-semibold leading-4", categoryMeta.text)}>
                {shortName}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "absolute bottom-1.5 right-1.5 flex size-7 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(15,23,42,0.18)]",
              accent.iconBg,
            )}
          >
            {icon}
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

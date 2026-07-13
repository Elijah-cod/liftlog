import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, BookOpenText, CalendarRange, Dumbbell, LogOut, Play, Settings2, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import type { TrainingViewer } from "@/lib/training/viewer";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Dumbbell },
  { href: "/plan", label: "My plan", icon: CalendarRange },
  { href: "/train", label: "Train", icon: Play },
  { href: "/exercises", label: "Exercises", icon: BookOpenText },
  { href: "/progress", label: "Progress", icon: BarChart3 },
] as const;

interface TrainingShellProps {
  children: ReactNode;
  active: (typeof NAV_ITEMS)[number]["label"];
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  wide?: boolean;
  viewer: TrainingViewer;
}

export function TrainingShell({
  children,
  active,
  eyebrow,
  title,
  description,
  actions,
  wide = true,
  viewer,
}: TrainingShellProps) {
  return (
    <AppShell contentClassName="min-h-[calc(100vh-3rem)]">
      <div className="grid min-h-[calc(100vh-3rem)] md:grid-cols-[13.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-200/80 bg-[oklch(0.985_0.008_255/0.88)] px-4 py-5 md:flex md:flex-col">
          <Link href="/today" className="flex items-center gap-3 px-2">
            <span className="flex size-10 items-center justify-center rounded-[14px] bg-[oklch(0.58_0.19_255)] text-white shadow-[0_10px_25px_oklch(0.58_0.19_255/0.22)]">
              <Dumbbell className="size-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-slate-950">LiftLog</span>
              <span className="block text-[11px] font-medium text-slate-500">Adaptive training</span>
            </span>
          </Link>

          <nav className="mt-8 space-y-1" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-[16px] px-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-950",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-[20px] border border-slate-200 bg-white/80 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Settings2 className="size-3.5" />
                Plan adapts with you
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Update equipment, schedule, or priorities whenever life changes.
              </p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white/80 p-3">
              <div className="flex min-w-0 items-center gap-2">
                {viewer.mode === "live" ? <ShieldCheck className="size-3.5 shrink-0 text-emerald-600" /> : <Sparkles className="size-3.5 shrink-0 text-sky-600" />}
                <span className="truncate text-xs font-semibold text-slate-700">{viewer.label}</span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">
                {viewer.mode === "live" ? "Private account data" : "Local demo data"}
              </p>
              <form action={viewer.mode === "live" ? "/auth/sign-out" : "/auth/demo/exit"} method="post" className="mt-2">
                <button type="submit" className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-blue-700">
                  <LogOut className="size-3.5" />
                  {viewer.mode === "live" ? "Sign out" : "Exit demo"}
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-white/80 px-4 pb-5 pt-6 sm:px-6 sm:pt-7 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>
                ) : null}
                <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-[68ch] text-sm leading-6 text-slate-600">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>

            {viewer.mode === "demo" ? (
              <div className="mt-4 flex flex-col gap-2 rounded-[16px] border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-900 sm:flex-row sm:items-center sm:justify-between">
                <span><strong>Interactive demo.</strong> Changes stay in this browser and never mix with member data.</span>
                <Link href="/login?mode=signup" className="shrink-0 font-semibold text-blue-700">Create a private account</Link>
              </div>
            ) : null}

            <nav className="-mx-1 mt-5 flex gap-1 overflow-x-auto pb-1 md:hidden" aria-label="Primary navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.label === active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-semibold",
                      isActive ? "bg-slate-950 text-white" : "border border-slate-200 bg-white/80 text-slate-600",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className={cn("px-4 py-5 sm:px-6 lg:px-8 lg:py-7", !wide && "mx-auto max-w-4xl")}>{children}</main>
        </div>
      </div>
    </AppShell>
  );
}

import Link from "next/link";

import { scheduleWorkoutAgain } from "@/app/history/actions";

interface RepeatWorkoutActionsProps {
  authMode: "mock" | "live";
  templateId: string;
  workoutName: string;
  redirectTo: string;
  compact?: boolean;
}

export function RepeatWorkoutActions({
  authMode,
  templateId,
  workoutName,
  redirectTo,
  compact = false,
}: RepeatWorkoutActionsProps) {
  if (authMode !== "live") {
    return (
      <Link
        href="/setup"
        className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
      >
        Use live mode to schedule again
      </Link>
    );
  }

  const containerClassName = compact ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-3";
  const buttonClassName = compact
    ? "rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
    : "flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700";

  return (
    <div className={containerClassName}>
      <form action={scheduleWorkoutAgain}>
        <input type="hidden" name="templateId" value={templateId} />
        <input type="hidden" name="workoutName" value={workoutName} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="slot" value="today" />
        <button type="submit" className={buttonClassName}>
          Schedule for today
        </button>
      </form>
      <form action={scheduleWorkoutAgain}>
        <input type="hidden" name="templateId" value={templateId} />
        <input type="hidden" name="workoutName" value={workoutName} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="slot" value="tomorrow" />
        <button type="submit" className={buttonClassName}>
          Schedule for tomorrow
        </button>
      </form>
    </div>
  );
}

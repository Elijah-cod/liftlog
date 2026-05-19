"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  NotebookPen,
  Plus,
  RefreshCw,
  Save,
  X,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
import { ExerciseMediaTile } from "@/components/exercise-media-tile";
import { RestTimer } from "@/components/rest-timer";
import {
  buildExerciseGroups,
  formatPreviousPerformance,
  formatWorkoutDate,
} from "@/lib/session-utils";
import { useWorkoutSessionStore } from "@/lib/store/workout-session-store";
import type { ApiResponse, SessionExercise, WorkoutSessionDetail, WorkoutSet } from "@/lib/types";
import { cn, secondsToClock } from "@/lib/utils";

interface ActiveWorkoutClientProps {
  initialSession: WorkoutSessionDetail;
  viewerLabel: string;
  authMode: "mock" | "live";
}

type SaveState = "saved" | "saving" | "error";
type DraftRecoveryState = {
  restoredAt: string;
  localNewerThanServer: boolean;
} | null;

function getSetRowClasses(set: WorkoutSet) {
  if (set.completed) {
    return "border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#f0fdf4)]";
  }

  if (set.isExtraSet) {
    return "border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,#eef2ff)]";
  }

  return "border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eff6ff)]";
}

function getSetBadgeClasses(set: WorkoutSet) {
  if (set.completed) {
    return "border-emerald-200 bg-white text-emerald-700";
  }

  if (set.isExtraSet) {
    return "border-violet-200 bg-white text-violet-700";
  }

  return "border-sky-200 bg-white text-sky-700";
}

function getSetStatusLabel(set: WorkoutSet) {
  if (set.completed) {
    return "Done";
  }

  if (set.isExtraSet) {
    return "Extra";
  }

  return "Pending";
}

async function getJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.error || payload.data === null) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
}

function NumberInput({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: number | null;
  onChange: (nextValue: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      inputMode="decimal"
      value={value ?? ""}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => {
        const nextValue = event.target.value.trim();
        onChange(nextValue === "" ? null : Number(nextValue));
      }}
      className="soft-field h-12 w-full rounded-[18px] px-3 text-center text-base font-semibold text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    />
  );
}

function SetRow({
  exercise,
  set,
  index,
  unitPreference,
  onChangeSet,
  onToggleComplete,
  onRemoveSet,
}: {
  exercise: SessionExercise;
  set: WorkoutSet;
  index: number;
  unitPreference: string;
  onChangeSet: (patch: Partial<WorkoutSet>) => void;
  onToggleComplete: () => void;
  onRemoveSet: () => void;
}) {
  const previousPerformance = formatPreviousPerformance(exercise, index);

  return (
    <div
      className={cn(
        "rounded-[24px] border px-3 py-3 shadow-sm transition-colors",
        getSetRowClasses(set),
      )}
    >
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-slate-700">{set.setLabel}</div>
          <span
            className={cn(
              "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
              getSetBadgeClasses(set),
            )}
          >
            {getSetStatusLabel(set)}
          </span>
        </div>
        <div className="min-w-0 text-right text-sm text-slate-500">{previousPerformance}</div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:hidden">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {exercise.loadType === "weighted" ? unitPreference : "Load"}
            </p>
            {exercise.loadType === "weighted" ? (
              <NumberInput
                value={set.weight}
                onChange={(weight) => onChangeSet({ weight })}
                placeholder={unitPreference}
              />
            ) : (
              <div className="h-12 rounded-[18px] border border-dashed border-slate-200 bg-white/70" />
            )}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {exercise.loadType === "timed" ? "Duration" : "Reps"}
            </p>
            {exercise.loadType === "timed" ? (
              <NumberInput
                value={set.durationSeconds}
                onChange={(durationSeconds) => onChangeSet({ durationSeconds })}
                placeholder="sec"
              />
            ) : (
              <NumberInput
                value={set.reps}
                onChange={(reps) => onChangeSet({ reps: reps === null ? null : Math.round(reps) })}
                placeholder="reps"
              />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/75 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {set.completed ? "Completed" : set.isExtraSet ? "Extra set" : "Ready to log"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleComplete}
              className={cn(
                "flex size-11 items-center justify-center rounded-full border transition",
                set.completed
                  ? "border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#d1fae5)] text-emerald-700"
                  : "border-sky-200 bg-white text-slate-400 hover:border-sky-300 hover:text-sky-600",
              )}
              aria-label={set.completed ? "Mark set incomplete" : "Mark set complete"}
            >
              <CheckCircle2 className="size-5" />
            </button>
            {set.isExtraSet ? (
              <button
                type="button"
                onClick={onRemoveSet}
                className="flex size-9 items-center justify-center rounded-full bg-white text-slate-400 transition hover:text-rose-600"
                aria-label="Remove extra set"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden grid-cols-[auto,minmax(0,1.3fr),1fr,1fr,auto] items-center gap-2 sm:grid">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{set.setLabel}</span>
          <span
            className={cn(
              "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
              getSetBadgeClasses(set),
            )}
          >
            {getSetStatusLabel(set)}
          </span>
        </div>
        <div className="min-w-0 text-sm text-slate-500">{previousPerformance}</div>
        <div>
          {exercise.loadType === "weighted" ? (
            <NumberInput value={set.weight} onChange={(weight) => onChangeSet({ weight })} placeholder={unitPreference} />
          ) : (
            <div className="h-12 rounded-[18px] border border-dashed border-slate-200 bg-white/70" />
          )}
        </div>
        <div>
          {exercise.loadType === "timed" ? (
            <NumberInput
              value={set.durationSeconds}
              onChange={(durationSeconds) => onChangeSet({ durationSeconds })}
              placeholder="sec"
            />
          ) : (
            <NumberInput value={set.reps} onChange={(reps) => onChangeSet({ reps: reps === null ? null : Math.round(reps) })} placeholder="reps" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleComplete}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border transition",
              set.completed
                ? "border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#d1fae5)] text-emerald-700"
                : "border-sky-200 bg-white text-slate-400 hover:border-sky-300 hover:text-sky-600",
            )}
            aria-label={set.completed ? "Mark set incomplete" : "Mark set complete"}
          >
            <CheckCircle2 className="size-5" />
          </button>
          {set.isExtraSet ? (
            <button
              type="button"
              onClick={onRemoveSet}
              className="flex size-9 items-center justify-center rounded-full bg-white text-slate-400 transition hover:text-rose-600"
              aria-label="Remove extra set"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ExercisePanel({
  exercise,
  unitPreference,
  expanded,
  onExpandedChange,
  onChangeSet,
  onToggleComplete,
  onAddSet,
  onRemoveSet,
  onChangeNote,
}: {
  exercise: SessionExercise;
  unitPreference: string;
  expanded: boolean;
  onExpandedChange: (value: boolean) => void;
  onChangeSet: (setId: string, patch: Partial<WorkoutSet>) => void;
  onToggleComplete: (setId: string, completed: boolean) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onChangeNote: (value: string) => void;
}) {
  const complete = exercise.sets.every((set) => set.completed);
  const completedSetCount = exercise.sets.filter((set) => set.completed).length;
  const extraSetCount = exercise.sets.filter((set) => set.isExtraSet).length;

  return (
    <article className="surface-panel rounded-[30px] px-4 py-4">
      <div className="flex items-start gap-4">
        <ExerciseMediaTile
          name={exercise.name}
          mediaPath={exercise.mediaPath}
          loadType={exercise.loadType}
          className="h-16 w-16 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold leading-6 text-slate-950">{exercise.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{exercise.subtitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-100 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  {completedSetCount}/{exercise.sets.length} sets logged
                </span>
                {extraSetCount > 0 ? (
                  <span className="rounded-full border border-violet-100 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">
                    {extraSetCount} extra
                  </span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onExpandedChange(!expanded)}
              className="quiet-button interactive-lift flex size-10 items-center justify-center rounded-full text-violet-700 shadow-sm"
              aria-label={expanded ? "Collapse exercise" : "Expand exercise"}
            >
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
          {complete ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#dcfce7)] px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
              <CheckCircle2 className="size-4" />
              Done
            </div>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <>
          <div className="mt-4">
            <div className="flex items-start gap-3 rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,#eef2ff)] px-3 py-3">
              <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-white text-violet-700 shadow-sm">
                <NotebookPen className="size-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                  Accessory change
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  If you swap an exercise because equipment is busy, note the substitute here so the session still reads clearly later.
                </p>
              </div>
            </div>
            <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Notes
            </label>
            <textarea
              value={exercise.notes}
              onChange={(event) => onChangeNote(event.target.value)}
              placeholder="Add notes for this exercise"
              className="mt-2 h-20 w-full rounded-[18px] border border-amber-100 bg-[linear-gradient(135deg,#fffdf4,#fff7ed)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="mt-4 hidden grid-cols-[auto,minmax(0,1.3fr),1fr,1fr,auto] gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:grid">
            <span>Set</span>
            <span>Previous</span>
            <span>{exercise.loadType === "weighted" ? unitPreference : "Load"}</span>
            <span>{exercise.loadType === "timed" ? "Duration" : "Reps"}</span>
            <span>Done</span>
          </div>

          <div className="mt-2 space-y-2">
            {exercise.sets.map((set, index) => (
              <SetRow
                key={set.id}
                exercise={exercise}
                set={set}
                index={index}
                unitPreference={unitPreference}
                onChangeSet={(patch) => onChangeSet(set.id, patch)}
                onToggleComplete={() => onToggleComplete(set.id, !set.completed)}
                onRemoveSet={() => onRemoveSet(set.id)}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <RestTimer seconds={exercise.restSeconds} />
            <button
              type="button"
              onClick={onAddSet}
              className="interactive-lift flex items-center justify-center gap-2 rounded-[20px] border border-fuchsia-100 bg-[linear-gradient(135deg,#fdf4ff,#fae8ff)] px-4 py-3 text-sm font-semibold text-fuchsia-700"
            >
              <Plus className="size-4" />
              Add Set
            </button>
          </div>
        </>
      ) : null}
    </article>
  );
}

export function ActiveWorkoutClient({
  initialSession,
  viewerLabel,
  authMode,
}: ActiveWorkoutClientProps) {
  const router = useRouter();
  const session = useWorkoutSessionStore((state) => state.session);
  const hydrated = useWorkoutSessionStore((state) => state.hydrated);
  const setSession = useWorkoutSessionStore((state) => state.setSession);
  const hydrateDraft = useWorkoutSessionStore((state) => state.hydrateDraft);
  const mergeServerSession = useWorkoutSessionStore((state) => state.mergeServerSession);
  const updateSet = useWorkoutSessionStore((state) => state.updateSet);
  const updateNote = useWorkoutSessionStore((state) => state.updateNote);
  const addOptimisticSet = useWorkoutSessionStore((state) => state.addOptimisticSet);
  const removeOptimisticSet = useWorkoutSessionStore((state) => state.removeOptimisticSet);
  const persistDraft = useWorkoutSessionStore((state) => state.persistDraft);
  const clearDraft = useWorkoutSessionStore((state) => state.clearDraft);
  const [expandedIds, setExpandedIds] = useState<string[]>(initialSession.exercises.map((exercise) => exercise.id));
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [queuedRequestCount, setQueuedRequestCount] = useState(0);
  const [inFlightRequestCount, setInFlightRequestCount] = useState(0);
  const [failedRequestCount, setFailedRequestCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(initialSession.updatedAt);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [draftRecoveryState, setDraftRecoveryState] = useState<DraftRecoveryState>(null);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const timersRef = useRef<Map<string, number>>(new Map());
  const queuedKeysRef = useRef<Set<string>>(new Set());
  const inFlightRequestCountRef = useRef(0);
  const failedRequestsRef = useRef<Map<string, () => Promise<void>>>(new Map());

  function syncUiState() {
    const queued = queuedKeysRef.current.size;
    const inFlight = inFlightRequestCountRef.current;
    const failed = failedRequestsRef.current.size;

    setQueuedRequestCount(queued);
    setInFlightRequestCount(inFlight);
    setFailedRequestCount(failed);
    setSaveState(failed > 0 ? "error" : queued > 0 || inFlight > 0 ? "saving" : "saved");
  }

  function formatSyncTime(dateTime: string) {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    const draft = window.localStorage.getItem(`liftlog-session-${initialSession.id}`);

    if (draft) {
      try {
        const parsed = JSON.parse(draft) as WorkoutSessionDetail;
        const localUpdatedAt = Date.parse(parsed.updatedAt);
        const serverUpdatedAt = Date.parse(initialSession.updatedAt);

        setDraftRecoveryState({
          restoredAt: parsed.updatedAt,
          localNewerThanServer:
            Number.isFinite(localUpdatedAt) &&
            Number.isFinite(serverUpdatedAt) &&
            localUpdatedAt > serverUpdatedAt,
        });
      } catch {
        setDraftRecoveryState(null);
      }

      hydrateDraft(initialSession.id);
    } else {
      setDraftRecoveryState(null);
      setSession(initialSession);
    }
  }, [hydrateDraft, initialSession, setSession]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistDraft();
  }, [hydrated, persistDraft, session]);

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  async function refreshSession() {
    try {
      const serverSession = await getJson<WorkoutSessionDetail>(`/api/sessions/${initialSession.id}`);
      mergeServerSession(serverSession);
      setLastSyncedAt(serverSession.updatedAt);
      setLastErrorMessage(null);
      syncUiState();
    } catch {
      setLastErrorMessage("Unable to refresh the latest server state right now.");
      setSaveState("error");
    }
  }

  async function refreshFromServerAndDiscardLocalDraft() {
    setSaveState("saving");
    setLastErrorMessage(null);

    try {
      const serverSession = await getJson<WorkoutSessionDetail>(`/api/sessions/${initialSession.id}`);

      for (const timerId of timersRef.current.values()) {
        window.clearTimeout(timerId);
      }

      timersRef.current.clear();
      queuedKeysRef.current.clear();
      failedRequestsRef.current.clear();
      inFlightRequestCountRef.current = 0;

      clearDraft();
      setSession(serverSession);
      setDraftRecoveryState(null);
      setLastSyncedAt(serverSession.updatedAt);
      syncUiState();
    } catch (error) {
      setLastErrorMessage(
        error instanceof Error ? error.message : "Unable to refresh the server copy.",
      );
      setSaveState("error");
    }
  }

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const timerId = window.setTimeout(() => {
      void (async () => {
        try {
          const serverSession = await getJson<WorkoutSessionDetail>(`/api/sessions/${initialSession.id}`);
          mergeServerSession(serverSession);
          setLastSyncedAt(serverSession.updatedAt);
          setLastErrorMessage(null);
          syncUiState();
        } catch {
          setSaveState("error");
          setLastErrorMessage("Unable to confirm the latest sync state.");
        }
      })();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [hydrated, initialSession.id, mergeServerSession]);

  async function executeRequest(key: string, callback: () => Promise<void>) {
    failedRequestsRef.current.delete(key);
    inFlightRequestCountRef.current += 1;
    syncUiState();

    try {
      await callback();
      setLastSyncedAt(new Date().toISOString());

      if (failedRequestsRef.current.size === 0) {
        setLastErrorMessage(null);
      }
    } catch (error) {
      failedRequestsRef.current.set(key, callback);
      setLastErrorMessage(
        error instanceof Error ? error.message : "Unable to sync the latest changes.",
      );
      setSaveState("error");
      throw error;
    } finally {
      inFlightRequestCountRef.current = Math.max(0, inFlightRequestCountRef.current - 1);
      syncUiState();
    }
  }

  function queueRequest(key: string, callback: () => Promise<void>) {
    const previousTimer = timersRef.current.get(key);

    if (previousTimer) {
      window.clearTimeout(previousTimer);
    }

    failedRequestsRef.current.delete(key);
    queuedKeysRef.current.add(key);
    syncUiState();

    const timerId = window.setTimeout(async () => {
      queuedKeysRef.current.delete(key);
      timersRef.current.delete(key);
      syncUiState();

      try {
        await executeRequest(key, callback);
      } catch {
        return;
      }
    }, 350);

    timersRef.current.set(key, timerId);
  }

  async function retryFailedRequests() {
    const failedEntries = [...failedRequestsRef.current.entries()];

    if (failedEntries.length === 0) {
      void refreshSession();
      return;
    }

    for (const [key, callback] of failedEntries) {
      try {
        await executeRequest(key, callback);
      } catch {
        continue;
      }
    }

    void refreshSession();
  }

  const sessionGroups = useMemo(
    () => (session ? buildExerciseGroups(session.exercises) : []),
    [session],
  );

  if (!session) {
    return (
      <AppShell contentClassName="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <LoaderCircle className="size-8 animate-spin" />
          <p className="text-sm font-medium">Loading your workout...</p>
        </div>
      </AppShell>
    );
  }

  const incompleteWork = session.progress.completedExercises !== session.progress.totalExercises;
  const hasPendingSyncWork = queuedRequestCount + inFlightRequestCount > 0;
  const hasBlockingSyncIssue = hasPendingSyncWork || failedRequestCount > 0;
  const progressPercent =
    session.progress.totalExercises > 0
      ? Math.round((session.progress.completedExercises / session.progress.totalExercises) * 100)
      : 0;

  const handleSetChange = (
    sessionExerciseId: string,
    setId: string,
    patch: Partial<WorkoutSet>,
  ) => {
    updateSet(sessionExerciseId, setId, patch);
    queueRequest(`set:${setId}`, async () => {
      const nextSession = await getJson<WorkoutSessionDetail>(`/api/sessions/${session.id}/sets/${setId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      mergeServerSession(nextSession);
    });
  };

  const handleNoteChange = (sessionExerciseId: string, notes: string) => {
    updateNote(sessionExerciseId, notes);
    queueRequest(`note:${sessionExerciseId}`, async () => {
      const nextSession = await getJson<WorkoutSessionDetail>(
        `/api/sessions/${session.id}/exercises/${sessionExerciseId}/note`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        },
      );
      mergeServerSession(nextSession);
    });
  };

  const handleAddSet = async (sessionExerciseId: string) => {
    addOptimisticSet(sessionExerciseId);
    syncUiState();

    try {
      await executeRequest(`add-set:${sessionExerciseId}`, async () => {
        const nextSession = await getJson<WorkoutSessionDetail>(
          `/api/sessions/${session.id}/exercises/${sessionExerciseId}/sets`,
          {
            method: "POST",
          },
        );
        mergeServerSession(nextSession);
      });
    } catch {
      void refreshSession();
    }
  };

  const handleRemoveSet = async (setId: string) => {
    removeOptimisticSet(setId);
    syncUiState();

    try {
      await executeRequest(`remove-set:${setId}`, async () => {
        const nextSession = await getJson<WorkoutSessionDetail>(
          `/api/sessions/${session.id}/sets/${setId}`,
          {
            method: "DELETE",
          },
        );
        mergeServerSession(nextSession);
      });
    } catch {
      void refreshSession();
    }
  };

  const finishWorkout = async () => {
    syncUiState();

    try {
      await executeRequest("finish", async () => {
        await getJson<WorkoutSessionDetail>(`/api/sessions/${session.id}/finish`, {
          method: "POST",
        });
      });
      clearDraft();
      startTransition(() => {
        router.push(`/sessions/${session.id}/complete`);
      });
    } catch {
      setSaveState("error");
    }
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-white/70 px-5 pb-5 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="eyebrow-chip">
                <Save className="size-3.5" />
                Active session
              </div>
              <p className="mt-4 text-sm font-medium text-sky-700">{formatWorkoutDate(session.scheduledDate)}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950 text-balance">
                {session.workoutName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 text-pretty">
                Keep the current set close, keep the log trustworthy, and leave yourself a readable record if the session changes on the fly.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
              <button
                type="button"
                onClick={() => {
                  if (hasBlockingSyncIssue) {
                    return;
                  }

                  if (incompleteWork) {
                    setFinishConfirmOpen(true);
                    return;
                  }

                  void finishWorkout();
                }}
                disabled={hasBlockingSyncIssue}
                className={cn(
                  "action-button interactive-lift w-full rounded-full px-4 py-3 text-sm font-semibold text-white sm:w-auto",
                  hasBlockingSyncIssue
                    ? "cursor-not-allowed bg-slate-300 shadow-none hover:translate-y-0 hover:brightness-100"
                    : "",
                )}
              >
                Finish
              </button>
              {hasBlockingSyncIssue ? (
                <p className="max-w-[16rem] text-[11px] font-medium leading-4 text-slate-500 sm:text-right">
                  {failedRequestCount > 0
                    ? "Retry or refresh sync issues before finishing."
                    : "Wait for current changes to finish syncing."}
                </p>
              ) : null}
            </div>
          </div>
          <div className="surface-panel mt-5 rounded-[28px] px-4 py-4">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600">
              <span>
                {session.progress.completedExercises}/{session.progress.totalExercises} completed
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#0ea5e9 55%,#8b5cf6)] transition-all"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="metric-panel rounded-[20px] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Exercises</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{session.progress.totalExercises}</p>
              </div>
              <div className="metric-panel rounded-[20px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#dcfce7)] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Finished</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{session.progress.completedExercises}</p>
              </div>
              <div className="metric-panel rounded-[20px] border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,#eef2ff)] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">Rest cue</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {secondsToClock(session.exercises[0]?.restSeconds ?? 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="surface-panel mt-4 flex flex-col gap-3 rounded-[24px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Autosave</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {saveState === "saving"
                  ? queuedRequestCount + inFlightRequestCount > 1
                    ? `Syncing ${queuedRequestCount + inFlightRequestCount} changes...`
                    : "Syncing workout..."
                  : saveState === "error"
                    ? failedRequestCount > 1
                      ? `${failedRequestCount} changes are saved locally and still need sync.`
                      : "A recent change is saved locally and still needs sync."
                    : `Synced at ${formatSyncTime(lastSyncedAt)}. Local draft backup is active.`}
              </p>
              {saveState === "error" && lastErrorMessage ? (
                <p className="mt-1 text-xs text-rose-700">{lastErrorMessage}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {saveState === "error" ? (
                <button
                  type="button"
                  onClick={() => void retryFailedRequests()}
                  className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700"
                >
                  <RefreshCw className="size-3.5" />
                  Retry
                </button>
              ) : null}
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                  saveState === "error"
                    ? "bg-rose-100 text-rose-700"
                    : saveState === "saving"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700",
                )}
              >
                <Save className="size-3.5" />
                {saveState}
              </div>
            </div>
          </div>
          {draftRecoveryState ? (
            <div
              className={cn(
                "mt-3 rounded-[24px] border px-4 py-3",
                draftRecoveryState.localNewerThanServer
                  ? "border-amber-200 bg-amber-50"
                  : "border-sky-200 bg-sky-50",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Restored Local Draft
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    Restored changes from {formatSyncTime(draftRecoveryState.restoredAt)} on this device.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {draftRecoveryState.localNewerThanServer
                      ? "This local draft is newer than the current server copy. Keep logging here, or refresh from server if you want to discard the local version."
                      : "This draft was recovered after reload. You can refresh from server if you want to discard the local copy and pull the latest server state."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshFromServerAndDiscardLocalDraft()}
                  className="secondary-button interactive-lift rounded-full px-3 py-2 text-xs font-semibold text-slate-700 sm:shrink-0"
                >
                  Refresh From Server
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {sessionGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                {group.exercises.length > 1 ? (
                  <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Superset
                  </div>
                ) : null}
                {group.exercises.map((exercise) => {
                  const expanded = expandedIds.includes(exercise.id);

                  return (
                    <ExercisePanel
                      key={exercise.id}
                      exercise={exercise}
                      unitPreference={session.unitPreference}
                      expanded={expanded}
                      onExpandedChange={(value) =>
                        setExpandedIds((current) =>
                          value ? [...current, exercise.id] : current.filter((id) => id !== exercise.id),
                        )
                      }
                      onChangeSet={(setId, patch) => handleSetChange(exercise.id, setId, patch)}
                      onToggleComplete={(setId, completed) => handleSetChange(exercise.id, setId, { completed })}
                      onAddSet={() => void handleAddSet(exercise.id)}
                      onRemoveSet={(setId) => void handleRemoveSet(setId)}
                      onChangeNote={(value) => handleNoteChange(exercise.id, value)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <div className="sticky bottom-0 border-t border-slate-200/70 bg-white/85 px-4 py-4 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Rest timers reset per exercise. Draft recovery is active. Current rest reference:{" "}
              {secondsToClock(session.exercises[0]?.restSeconds ?? 0)}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              <ArrowUpRight className="size-3.5 text-slate-400" />
              Finish when sync is clear
            </div>
          </div>
        </div>
      </div>

      {finishConfirmOpen ? (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-slate-950/25 p-3">
          <div className="w-full rounded-[28px] bg-white p-5 shadow-2xl">
            <h2 className="font-display text-2xl font-semibold text-slate-950">Finish early?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Some sets are still incomplete. Finishing now will save this workout as partial, and you can still review everything that was logged.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFinishConfirmOpen(false)}
                className="secondary-button interactive-lift rounded-full px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Keep Logging
              </button>
              <button
                type="button"
                onClick={() => {
                  setFinishConfirmOpen(false);
                  void finishWorkout();
                }}
                className="action-button interactive-lift rounded-full px-4 py-3 text-sm font-semibold text-white"
              >
                Save Partial
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

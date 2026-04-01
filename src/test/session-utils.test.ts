import { buildProgress, compareMetricTrend } from "@/lib/session-utils";
import type { SessionExercise } from "@/lib/types";

function makeExercise(overrides?: Partial<SessionExercise>): SessionExercise {
  return {
    id: "exercise-1",
    exerciseDefinitionId: "exercise-def-1",
    name: "Flat Dumbbell Press",
    subtitle: "3 sets · 8-12 reps",
    loadType: "weighted",
    perSide: false,
    notes: "",
    noteUpdatedAt: new Date().toISOString(),
    restSeconds: 120,
    sortOrder: 1,
    blockKey: null,
    blockRole: null,
    plannedSets: 3,
    mediaPath: "/media/exercise-placeholder.svg",
    sets: [
      {
        id: "set-1",
        setOrder: 1,
        setLabel: "1",
        blockRole: null,
        loadType: "weighted",
        planned: true,
        isExtraSet: false,
        weight: 10,
        reps: 10,
        durationSeconds: null,
        completed: true,
        updatedAt: new Date().toISOString(),
        previousWeight: 10,
        previousReps: 9,
        previousDurationSeconds: null,
        previousTrend: "up",
      },
    ],
    ...overrides,
  };
}

describe("session utils", () => {
  it("builds progress from completed exercises and sets", () => {
    const exercises = [
      makeExercise(),
      makeExercise({
        id: "exercise-2",
        sets: [
          {
            ...makeExercise().sets[0],
            id: "set-2",
            completed: false,
          },
        ],
      }),
    ];

    expect(buildProgress(exercises)).toEqual({
      completedExercises: 1,
      totalExercises: 2,
      completedSets: 1,
      totalSets: 2,
    });
  });

  it("compares metric trends", () => {
    expect(compareMetricTrend(10, 8)).toBe("up");
    expect(compareMetricTrend(8, 10)).toBe("down");
    expect(compareMetricTrend(10, 10)).toBe("flat");
    expect(compareMetricTrend(null, 10)).toBeNull();
  });
});


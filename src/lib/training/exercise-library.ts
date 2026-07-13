import type {
  Equipment,
  ExerciseLibraryItem,
  ExperienceLevel,
  MovementPattern,
  MuscleGroup,
} from "@/lib/training/types";

interface ExerciseBase {
  name: string;
  muscle: MuscleGroup;
  secondary?: MuscleGroup[];
  equipment: Equipment;
  pattern: MovementPattern;
  difficulty?: ExperienceLevel;
  home?: boolean;
  rehab?: boolean;
  slug?: string;
  cues: [string, string, string];
  reps?: [number, number];
}

const BASE_EXERCISES: ExerciseBase[] = [
  { name: "Barbell Bench Press", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "barbell", pattern: "horizontal-push", difficulty: "intermediate", slug: "barbell-bench-press", cues: ["Pin your upper back to the bench", "Stack wrists over elbows", "Touch the same point on your lower chest each rep"], reps: [5, 8] },
  { name: "Dumbbell Bench Press", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "dumbbell", pattern: "horizontal-push", home: true, slug: "dumbbell-bench-press", cues: ["Set the shoulder blades before pressing", "Use a comfortable elbow angle", "Lower with control until the pecs are stretched"] },
  { name: "Incline Dumbbell Press", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "dumbbell", pattern: "horizontal-push", home: true, slug: "dumbbell-incline-bench-press", cues: ["Use a low incline", "Keep forearms vertical", "Press up and slightly back"] },
  { name: "Cable Chest Fly", muscle: "chest", equipment: "cable", pattern: "isolation", slug: "cable-middle-fly", cues: ["Keep a soft elbow bend", "Let the upper arm travel, not the hand", "Finish by bringing the biceps together"], reps: [10, 15] },
  { name: "Push-Up", muscle: "chest", secondary: ["triceps", "shoulders", "core"], equipment: "bodyweight", pattern: "horizontal-push", home: true, slug: "push-up", cues: ["Brace from ribs to pelvis", "Keep elbows roughly 30 to 60 degrees out", "Move chest and hips together"] },
  { name: "Machine Chest Press", muscle: "chest", secondary: ["triceps"], equipment: "machine", pattern: "horizontal-push", slug: "machine-chest-press", cues: ["Adjust the seat to mid-chest", "Keep shoulders supported", "Drive through the full comfortable range"] },
  { name: "Pull-Up", muscle: "back", secondary: ["biceps"], equipment: "bodyweight", pattern: "vertical-pull", difficulty: "intermediate", home: true, slug: "pull-ups", cues: ["Begin from an active shoulder", "Pull elbows toward your ribs", "Avoid reaching with the chin"] },
  { name: "Lat Pulldown", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "vertical-pull", slug: "cable-pulldown", cues: ["Set the ribs before pulling", "Drive elbows down", "Control the stretch overhead"] },
  { name: "Chest-Supported Row", muscle: "back", secondary: ["biceps"], equipment: "dumbbell", pattern: "horizontal-pull", home: true, slug: "dumbbell-chest-supported-row", cues: ["Keep the chest heavy on the pad", "Reach at the bottom", "Pull toward the back pocket"] },
  { name: "Seated Cable Row", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "horizontal-pull", slug: "cable-seated-row", cues: ["Stay tall through the torso", "Lead with the elbows", "Pause without leaning back"] },
  { name: "One-Arm Dumbbell Row", muscle: "back", secondary: ["biceps"], equipment: "dumbbell", pattern: "horizontal-pull", home: true, slug: "dumbbell-row-unilateral", cues: ["Square the hips", "Reach long at the bottom", "Row toward the hip"] },
  { name: "Inverted Row", muscle: "back", secondary: ["biceps", "core"], equipment: "bodyweight", pattern: "horizontal-pull", home: true, slug: "bodyweight-inverted-row", cues: ["Keep a straight body line", "Pull the bar to lower chest", "Control the lowering phase"] },
  { name: "Barbell Overhead Press", muscle: "shoulders", secondary: ["triceps", "core"], equipment: "barbell", pattern: "vertical-push", difficulty: "intermediate", slug: "barbell-overhead-press", cues: ["Stack ribs over pelvis", "Move the head around the bar", "Finish with the bar over midfoot"], reps: [5, 8] },
  { name: "Dumbbell Shoulder Press", muscle: "shoulders", secondary: ["triceps"], equipment: "dumbbell", pattern: "vertical-push", home: true, slug: "dumbbell-seated-overhead-press", cues: ["Keep forearms vertical", "Use a pain-free grip", "Finish without shrugging excessively"] },
  { name: "Cable Lateral Raise", muscle: "shoulders", equipment: "cable", pattern: "isolation", slug: "cable-low-single-arm-lateral-raise", cues: ["Lead with the elbow", "Raise in the scapular plane", "Stop near shoulder height"], reps: [12, 20] },
  { name: "Dumbbell Lateral Raise", muscle: "shoulders", equipment: "dumbbell", pattern: "isolation", home: true, slug: "dumbbell-lateral-raise", cues: ["Use a slight forward torso angle", "Keep traps relaxed", "Control the bottom half"], reps: [12, 20] },
  { name: "Reverse Pec Deck", muscle: "shoulders", secondary: ["back"], equipment: "machine", pattern: "isolation", slug: "machine-reverse-fly", cues: ["Keep chest supported", "Move through the rear shoulder", "Pause with arms in line with the torso"], reps: [12, 20] },
  { name: "Face Pull", muscle: "shoulders", secondary: ["back"], equipment: "cable", pattern: "rehab", rehab: true, slug: "cable-face-pull", cues: ["Set the cable around eye height", "Pull toward the eyebrows", "Rotate only through a comfortable range"], reps: [12, 20] },
  { name: "Barbell Back Squat", muscle: "quads", secondary: ["glutes", "core"], equipment: "barbell", pattern: "squat", difficulty: "intermediate", slug: "barbell-squat", cues: ["Balance over the whole foot", "Let knees and hips bend together", "Keep the bar over midfoot"], reps: [5, 8] },
  { name: "Front Squat", muscle: "quads", secondary: ["glutes", "core"], equipment: "barbell", pattern: "squat", difficulty: "intermediate", slug: "barbell-front-squat", cues: ["Keep elbows high", "Sit between the hips", "Drive the floor away"] },
  { name: "Goblet Squat", muscle: "quads", secondary: ["glutes", "core"], equipment: "dumbbell", pattern: "squat", home: true, slug: "dumbbell-goblet-squat", cues: ["Hold the load close", "Track knees over toes", "Use the deepest controlled range"] },
  { name: "Leg Press", muscle: "quads", secondary: ["glutes"], equipment: "machine", pattern: "squat", slug: "machine-leg-press", cues: ["Keep hips heavy on the pad", "Lower until pelvis stays controlled", "Push through the full foot"] },
  { name: "Leg Extension", muscle: "quads", equipment: "machine", pattern: "isolation", slug: "machine-leg-extension", cues: ["Align the knee with the machine pivot", "Lift without bouncing", "Control the stretch at the bottom"], reps: [10, 15] },
  { name: "Bulgarian Split Squat", muscle: "quads", secondary: ["glutes"], equipment: "dumbbell", pattern: "lunge", home: true, slug: "dumbbell-bulgarian-split-squat", cues: ["Choose a stable stance", "Let the front knee travel naturally", "Drive through the front foot"] },
  { name: "Barbell Romanian Deadlift", muscle: "hamstrings", secondary: ["glutes", "back"], equipment: "barbell", pattern: "hinge", difficulty: "intermediate", slug: "barbell-romanian-deadlift", cues: ["Push hips back", "Keep the bar close", "Stop when the hamstrings limit the range"], reps: [6, 10] },
  { name: "Dumbbell Romanian Deadlift", muscle: "hamstrings", secondary: ["glutes", "back"], equipment: "dumbbell", pattern: "hinge", home: true, slug: "dumbbell-romanian-deadlift", cues: ["Keep shins nearly vertical", "Reach hips behind you", "Stand by driving the hips forward"] },
  { name: "Seated Leg Curl", muscle: "hamstrings", equipment: "machine", pattern: "isolation", slug: "machine-seated-leg-curl", cues: ["Pin hips into the seat", "Curl through a full range", "Control the return"], reps: [10, 15] },
  { name: "Slider Leg Curl", muscle: "hamstrings", secondary: ["glutes"], equipment: "bodyweight", pattern: "isolation", home: true, slug: "bodyweight-sliding-leg-curl", cues: ["Keep hips extended", "Pull heels toward the body", "Lengthen slowly"] },
  { name: "Barbell Hip Thrust", muscle: "glutes", secondary: ["hamstrings"], equipment: "barbell", pattern: "hinge", slug: "barbell-hip-thrust", cues: ["Tuck the pelvis at the top", "Keep ribs down", "Pause without overextending the back"] },
  { name: "Dumbbell Hip Thrust", muscle: "glutes", secondary: ["hamstrings"], equipment: "dumbbell", pattern: "hinge", home: true, slug: "dumbbell-hip-thrust", cues: ["Plant feet firmly", "Drive through the heels", "Finish with glutes, not the lower back"] },
  { name: "Reverse Lunge", muscle: "glutes", secondary: ["quads"], equipment: "dumbbell", pattern: "lunge", home: true, slug: "dumbbell-reverse-lunge", cues: ["Step back far enough for balance", "Keep pressure through the front foot", "Lower under control"] },
  { name: "Cable Glute Kickback", muscle: "glutes", equipment: "cable", pattern: "isolation", slug: "cable-glute-kickback", cues: ["Brace the torso", "Move from the hip", "Stop before the lower back extends"], reps: [12, 20] },
  { name: "Standing Calf Raise", muscle: "calves", equipment: "machine", pattern: "isolation", slug: "machine-standing-calf-raise", cues: ["Use a stable foot position", "Pause in the stretch", "Rise as high as control allows"], reps: [8, 15] },
  { name: "Single-Leg Calf Raise", muscle: "calves", equipment: "bodyweight", pattern: "isolation", home: true, slug: "bodyweight-single-leg-calf-raise", cues: ["Use support for balance", "Keep the knee softly extended", "Own the full range"], reps: [12, 20] },
  { name: "Dumbbell Curl", muscle: "biceps", equipment: "dumbbell", pattern: "isolation", home: true, slug: "dumbbell-curl", cues: ["Keep the upper arm quiet", "Turn the palm up as you curl", "Lower completely without swinging"], reps: [8, 15] },
  { name: "Cable Curl", muscle: "biceps", equipment: "cable", pattern: "isolation", slug: "cable-curl", cues: ["Set shoulders down", "Curl without moving the elbow forward", "Keep tension at the bottom"], reps: [10, 15] },
  { name: "Hammer Curl", muscle: "biceps", equipment: "dumbbell", pattern: "isolation", home: true, slug: "dumbbell-hammer-curl", cues: ["Use a neutral grip", "Keep wrists stacked", "Avoid torso momentum"], reps: [8, 15] },
  { name: "Cable Triceps Pressdown", muscle: "triceps", equipment: "cable", pattern: "isolation", slug: "cable-push-down", cues: ["Keep elbows by your sides", "Extend without leaning over", "Control the return"], reps: [10, 15] },
  { name: "Dumbbell Overhead Extension", muscle: "triceps", equipment: "dumbbell", pattern: "isolation", home: true, slug: "dumbbell-overhead-tricep-extension", cues: ["Keep ribs stacked", "Let elbows flex deeply", "Extend without flaring excessively"], reps: [10, 15] },
  { name: "Close-Grip Push-Up", muscle: "triceps", secondary: ["chest"], equipment: "bodyweight", pattern: "horizontal-push", home: true, slug: "diamond-push-up", cues: ["Choose a hand width that feels comfortable", "Keep the body rigid", "Finish with strong elbow extension"] },
  { name: "Cable Crunch", muscle: "core", equipment: "cable", pattern: "core", slug: "cable-kneeling-crunch", cues: ["Move ribs toward pelvis", "Keep hips mostly still", "Exhale through the shortened position"], reps: [10, 20] },
  { name: "Dead Bug", muscle: "core", equipment: "bodyweight", pattern: "rehab", home: true, rehab: true, slug: "bodyweight-dead-bug", cues: ["Keep ribs and pelvis stacked", "Move only as far as you can brace", "Exhale as the limb extends"], reps: [6, 12] },
  { name: "Side Plank", muscle: "core", equipment: "bodyweight", pattern: "core", home: true, rehab: true, slug: "bodyweight-side-plank", cues: ["Stack shoulder over elbow", "Lift hips into a straight line", "Breathe without losing position"], reps: [20, 45] },
  { name: "Pallof Press", muscle: "core", equipment: "band", pattern: "rehab", home: true, rehab: true, slug: "band-pallof-press", cues: ["Stand square to the anchor", "Press without rotating", "Exhale and keep the ribs down"], reps: [8, 15] },
  { name: "Farmer Carry", muscle: "core", secondary: ["back", "shoulders"], equipment: "dumbbell", pattern: "carry", home: true, slug: "dumbbell-farmers-carry", cues: ["Stand tall", "Take quiet controlled steps", "Keep the loads away from the thighs"], reps: [30, 60] },
  { name: "Band External Rotation", muscle: "shoulders", equipment: "band", pattern: "rehab", home: true, rehab: true, slug: "band-external-rotation", cues: ["Keep the elbow supported", "Rotate through a comfortable range", "Use light tension and slow control"], reps: [12, 20] },
  { name: "Spanish Squat", muscle: "quads", equipment: "band", pattern: "rehab", home: true, rehab: true, slug: "band-spanish-squat", cues: ["Anchor the band securely", "Sit back against the band", "Work only in a tolerable range"], reps: [10, 20] },
  { name: "Tibialis Raise", muscle: "calves", equipment: "bodyweight", pattern: "rehab", home: true, rehab: true, slug: "bodyweight-tibialis-raise", cues: ["Keep heels planted", "Lift toes toward the shins", "Lower slowly"], reps: [15, 25] },
  { name: "Incline Treadmill Walk", muscle: "glutes", secondary: ["calves"], equipment: "cardio", pattern: "cardio", slug: "treadmill-walking", cues: ["Use a pace you can sustain", "Stay tall instead of hanging on the rails", "Keep effort conversational for zone two"], reps: [10, 30] },
  { name: "Stationary Bike", muscle: "quads", secondary: ["glutes"], equipment: "cardio", pattern: "cardio", slug: "stationary-bike", cues: ["Set the seat for a soft knee bend", "Keep cadence smooth", "Match resistance to the intended effort"], reps: [10, 30] },
  { name: "Kettlebell Swing", muscle: "glutes", secondary: ["hamstrings", "core"], equipment: "kettlebell", pattern: "hinge", home: true, slug: "kettlebell-swing", cues: ["Hinge instead of squatting", "Keep the bell close on the backswing", "Snap the hips and let the arms follow"], reps: [10, 20] },
  { name: "Kettlebell Goblet Squat", muscle: "quads", secondary: ["glutes"], equipment: "kettlebell", pattern: "squat", home: true, slug: "kettlebell-goblet-squat", cues: ["Hold the bell close", "Keep the whole foot grounded", "Sit into the deepest controlled range"] },
  { name: "Band Row", muscle: "back", secondary: ["biceps"], equipment: "band", pattern: "horizontal-pull", home: true, slug: "band-row", cues: ["Anchor the band securely", "Reach and pull the elbows back", "Keep the torso quiet"] },
  { name: "Band Chest Press", muscle: "chest", secondary: ["triceps"], equipment: "band", pattern: "horizontal-push", home: true, slug: "band-chest-press", cues: ["Anchor at chest height", "Stagger the stance", "Press without shrugging"] },
];

const VARIANTS = [
  { label: "", suffix: "" },
  { label: "Paused", suffix: "paused" },
  { label: "3-Second Eccentric", suffix: "tempo" },
  { label: "Technique", suffix: "technique" },
  { label: "High-Rep", suffix: "high-rep" },
] as const;

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function youtubeTutorialUrl(name: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} exercise form tutorial evidence based`)}`;
}

function buildItem(base: ExerciseBase, variant: (typeof VARIANTS)[number]): ExerciseLibraryItem {
  const name = variant.label ? `${variant.label} ${base.name}` : base.name;
  const directMuscleWikiGuide = variant.suffix === "" && base.slug;

  return {
    id: variant.suffix ? `${toId(base.name)}-${variant.suffix}` : toId(base.name),
    name,
    canonicalName: base.name,
    primaryMuscle: base.muscle,
    secondaryMuscles: base.secondary ?? [],
    equipment: base.equipment,
    pattern: base.pattern,
    difficulty: base.difficulty ?? "beginner",
    homeFriendly: base.home ?? ["bodyweight", "band", "dumbbell", "kettlebell"].includes(base.equipment),
    isRehab: base.rehab ?? false,
    tutorialUrl: directMuscleWikiGuide
      ? `https://musclewiki.com/exercise/${base.slug}`
      : youtubeTutorialUrl(name),
    tutorialSource: directMuscleWikiGuide ? "MuscleWiki" : "YouTube",
    formCues: base.cues,
    repRange:
      variant.suffix === "high-rep"
        ? [Math.max(12, base.reps?.[0] ?? 12), Math.max(20, base.reps?.[1] ?? 20)]
        : (base.reps ?? [8, 12]),
  };
}

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = BASE_EXERCISES.flatMap((exercise) =>
  VARIANTS.map((variant) => buildItem(exercise, variant)),
);

export const CORE_EXERCISES = EXERCISE_LIBRARY.filter(
  (exercise) => !exercise.id.endsWith("-paused") && !exercise.id.endsWith("-tempo") && !exercise.id.endsWith("-technique") && !exercise.id.endsWith("-high-rep"),
);

export function findExercise(id: string) {
  return EXERCISE_LIBRARY.find((exercise) => exercise.id === id);
}

export function getExerciseSubstitutions(exerciseId: string, availableEquipment?: Equipment[]) {
  const exercise = findExercise(exerciseId);

  if (!exercise) return [];

  return CORE_EXERCISES.filter((candidate) => {
    if (candidate.id === exercise.id) return false;
    if (candidate.primaryMuscle !== exercise.primaryMuscle) return false;
    if (availableEquipment?.length && !availableEquipment.includes(candidate.equipment)) return false;
    return candidate.pattern === exercise.pattern || candidate.secondaryMuscles.includes(exercise.primaryMuscle);
  }).slice(0, 4);
}

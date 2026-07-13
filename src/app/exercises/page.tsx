import { ExerciseLibraryClient } from "@/components/exercise-library-client";
import { requireTrainingViewer } from "@/lib/server/auth";

export default async function ExercisesPage() {
  const { viewer } = await requireTrainingViewer("/exercises");
  return <ExerciseLibraryClient viewer={viewer} />;
}

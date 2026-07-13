import { AdaptiveWorkoutClient } from "@/components/adaptive-workout-client";
import { requireTrainingViewer } from "@/lib/server/auth";

export default async function TrainPage() {
  const { viewer } = await requireTrainingViewer("/train");
  return <AdaptiveWorkoutClient viewer={viewer} />;
}

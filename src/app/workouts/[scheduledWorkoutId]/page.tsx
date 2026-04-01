import { notFound, redirect } from "next/navigation";

import { WorkoutPreview } from "@/components/workout-preview";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface WorkoutPreviewPageProps {
  params: Promise<{
    scheduledWorkoutId: string;
  }>;
}

export default async function WorkoutPreviewPage({ params }: WorkoutPreviewPageProps) {
  const { scheduledWorkoutId } = await params;
  const repository = await getWorkoutRepository();
  const preview = await repository.getScheduledWorkoutPreview(scheduledWorkoutId);

  if (!preview) {
    notFound();
  }

  if (preview.activeSessionId) {
    redirect(`/sessions/${preview.activeSessionId}`);
  }

  return <WorkoutPreview workout={preview} />;
}

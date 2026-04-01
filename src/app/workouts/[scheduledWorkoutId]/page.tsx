import { notFound, redirect } from "next/navigation";

import { WorkoutPreview } from "@/components/workout-preview";
import { requirePageAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface WorkoutPreviewPageProps {
  params: Promise<{
    scheduledWorkoutId: string;
  }>;
}

export default async function WorkoutPreviewPage({ params }: WorkoutPreviewPageProps) {
  const { scheduledWorkoutId } = await params;
  const auth = await requirePageAuth(`/workouts/${scheduledWorkoutId}`);
  const repository = await getWorkoutRepository(auth);
  const preview = await repository.getScheduledWorkoutPreview(scheduledWorkoutId);

  if (!preview) {
    notFound();
  }

  if (preview.activeSessionId) {
    redirect(`/sessions/${preview.activeSessionId}`);
  }

  return (
    <WorkoutPreview
      workout={preview}
      viewerLabel={auth?.user.email ?? "Mock athlete"}
      authMode={auth ? "live" : "mock"}
    />
  );
}

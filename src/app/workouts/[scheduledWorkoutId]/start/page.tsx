import { notFound, redirect } from "next/navigation";

import { getWorkoutRepository } from "@/lib/server/workouts";

interface StartWorkoutPageProps {
  params: Promise<{
    scheduledWorkoutId: string;
  }>;
}

export default async function StartWorkoutPage({ params }: StartWorkoutPageProps) {
  const { scheduledWorkoutId } = await params;
  const repository = await getWorkoutRepository();
  const session = await repository.startWorkoutSession(scheduledWorkoutId);

  if (!session) {
    notFound();
  }

  redirect(
    session.status === "completed" || session.status === "partial"
      ? `/sessions/${session.id}/complete`
      : `/sessions/${session.id}`,
  );
}

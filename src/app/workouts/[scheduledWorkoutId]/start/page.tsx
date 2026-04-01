import { notFound, redirect } from "next/navigation";

import { requirePageAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface StartWorkoutPageProps {
  params: Promise<{
    scheduledWorkoutId: string;
  }>;
}

export default async function StartWorkoutPage({ params }: StartWorkoutPageProps) {
  const { scheduledWorkoutId } = await params;
  const auth = await requirePageAuth(`/workouts/${scheduledWorkoutId}/start`);
  const repository = await getWorkoutRepository(auth);
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

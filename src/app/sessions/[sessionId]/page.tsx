import { notFound, redirect } from "next/navigation";

import { ActiveWorkoutClient } from "@/components/active-workout-client";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const session = await getWorkoutRepository().getSessionDetail(sessionId);

  if (!session) {
    notFound();
  }

  if (session.status === "completed" || session.status === "partial") {
    redirect(`/sessions/${session.id}/complete`);
  }

  return <ActiveWorkoutClient initialSession={session} />;
}


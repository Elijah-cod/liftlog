import { notFound, redirect } from "next/navigation";

import { SessionSummary } from "@/components/session-summary";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface CompletePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function CompletePage({ params }: CompletePageProps) {
  const { sessionId } = await params;
  const session = await getWorkoutRepository().getSessionDetail(sessionId);

  if (!session) {
    notFound();
  }

  if (session.status === "active" || session.status === "draft") {
    redirect(`/sessions/${session.id}`);
  }

  return <SessionSummary session={session} />;
}


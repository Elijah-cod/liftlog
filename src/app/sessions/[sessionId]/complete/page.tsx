import { notFound, redirect } from "next/navigation";

import { SessionSummary } from "@/components/session-summary";
import { requirePageAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface CompletePageProps {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams: Promise<{
    scheduled?: string;
    slot?: string;
    actionError?: string;
  }>;
}

export default async function CompletePage({ params, searchParams }: CompletePageProps) {
  const { sessionId } = await params;
  const resolvedSearchParams = await searchParams;
  const auth = await requirePageAuth(`/sessions/${sessionId}/complete`);
  const repository = await getWorkoutRepository(auth);
  const session = await repository.getSessionDetail(sessionId);

  if (!session) {
    notFound();
  }

  if (session.status === "active" || session.status === "draft") {
    redirect(`/sessions/${session.id}`);
  }

  return (
    <SessionSummary
      session={session}
      viewerLabel={auth?.user.email ?? "Mock athlete"}
      authMode={auth ? "live" : "mock"}
      actionState={{
        scheduled: resolvedSearchParams.scheduled === "1",
        slot: resolvedSearchParams.slot,
        actionError: resolvedSearchParams.actionError,
      }}
    />
  );
}

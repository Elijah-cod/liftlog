import { ProgressDashboardClient } from "@/components/progress-dashboard-client";
import { requireTrainingViewer } from "@/lib/server/auth";

export default async function ProgressPage() {
  const { viewer } = await requireTrainingViewer("/progress");
  return <ProgressDashboardClient viewer={viewer} />;
}

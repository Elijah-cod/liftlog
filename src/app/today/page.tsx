import { TodayDashboardClient } from "@/components/today-dashboard-client";
import { requireTrainingViewer } from "@/lib/server/auth";
import { getTrainingPlan } from "@/lib/server/training-plans";

export default async function TodayPage() {
  const { auth, viewer } = await requireTrainingViewer("/today");
  const { plan } = await getTrainingPlan(auth);
  return <TodayDashboardClient initialPlan={plan} viewer={viewer} />;
}

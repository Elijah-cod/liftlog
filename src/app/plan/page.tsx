import { PlanBuilderClient } from "@/components/plan-builder-client";
import { requireTrainingViewer } from "@/lib/server/auth";
import { getTrainingPlan } from "@/lib/server/training-plans";

export default async function PlanPage() {
  const { auth, viewer } = await requireTrainingViewer("/plan");
  const saved = await getTrainingPlan(auth);

  return <PlanBuilderClient initialProfile={saved.profile} initialPlan={saved.plan} viewer={viewer} />;
}

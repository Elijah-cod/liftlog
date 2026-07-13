import { readFileSync } from "node:fs";
import { join } from "node:path";

import { trainingProfileSchema } from "@/lib/schemas";
import { DEFAULT_TRAINING_PROFILE } from "@/lib/training/defaults";

describe("private training plans", () => {
  it("accepts a complete routine profile and rejects unsafe input", () => {
    expect(trainingProfileSchema.safeParse(DEFAULT_TRAINING_PROFILE).success).toBe(true);
    expect(
      trainingProfileSchema.safeParse({
        ...DEFAULT_TRAINING_PROFILE,
        age: 8,
        priorityMuscles: ["shoulders", "glutes", "chest"],
      }).success,
    ).toBe(false);
  });

  it("ships row-level ownership rules for saved routines", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260713174238_add_private_training_plans.sql"),
      "utf8",
    );

    expect(migration).toContain("alter table public.training_plans enable row level security");
    expect(migration).toContain("using (auth.uid() = user_id)");
    expect(migration).toContain("with check (auth.uid() = user_id)");
  });
});

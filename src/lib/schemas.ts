import { z } from "zod";

export const saveSetSchema = z.object({
  weight: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
  completed: z.boolean().optional(),
});

export const saveNoteSchema = z.object({
  notes: z.string().max(1000),
});


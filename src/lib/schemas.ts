import { z } from "zod";

import { MUSCLE_GROUPS } from "@/lib/training/types";

export const saveSetSchema = z.object({
  weight: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
  completed: z.boolean().optional(),
});

export const saveNoteSchema = z.object({
  notes: z.string().max(1000),
});

const equipmentSchema = z.enum([
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "band",
  "kettlebell",
  "cardio",
]);

export const trainingProfileSchema = z.object({
  goal: z.enum(["strength", "muscle", "general"]),
  location: z.enum(["gym", "home"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  minutesPerSession: z.union([z.literal(30), z.literal(45), z.literal(60), z.literal(75)]),
  age: z.number().int().min(16).max(90),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(250),
  availableEquipment: z.array(equipmentSchema).min(1),
  priorityMuscles: z.array(z.enum(MUSCLE_GROUPS)).max(2),
  limitations: z.array(z.string().trim().max(160)).max(10),
});

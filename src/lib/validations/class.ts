import { z } from "zod";

export const classSchema = z.object({
  name: z.string().trim().min(1, "Class name is required"),
  section: z.string().trim().optional().or(z.literal("")),
  academic_year: z.string().trim().optional().or(z.literal("")),
});

export type ClassInput = z.infer<typeof classSchema>;

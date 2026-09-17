import { z } from "zod";

export const studentSchema = z.object({
  student_code: z.string().trim().min(1, "Student code is required"),
  full_name: z.string().trim().min(1, "Full name is required"),
  date_of_birth: z.string().trim().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  class_id: z.string().uuid().optional().or(z.literal("")),
  contact_phone: z.string().trim().optional().or(z.literal("")),
  contact_address: z.string().trim().optional().or(z.literal("")),
});

export type StudentInput = z.infer<typeof studentSchema>;

import { z } from "zod";

export const markAttendanceSchema = z.object({
  class_id: z.string().uuid(),
  date: z.string().min(1),
  records: z
    .array(
      z.object({
        student_id: z.string().uuid(),
        status: z.enum(["present", "absent", "late"]),
      }),
    )
    .min(1, "No students to mark"),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

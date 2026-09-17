import { z } from "zod";

export const createFeeSchema = z.object({
  target: z.enum(["class", "student"]),
  class_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  due_date: z.string().min(1, "Due date is required"),
});

export type CreateFeeInput = z.infer<typeof createFeeSchema>;

export const recordPaymentSchema = z.object({
  fee_id: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.string().trim().min(1),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

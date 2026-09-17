import { z } from "zod";

export const sendSmsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("fee_reminder"),
    feeIds: z.array(z.string().uuid()).min(1),
  }),
  z.object({
    type: z.literal("absence_alert"),
    studentIds: z.array(z.string().uuid()).min(1),
    date: z.string().min(1),
  }),
  z.object({
    type: z.literal("manual"),
    studentIds: z.array(z.string().uuid()).min(1),
    message: z.string().trim().min(1),
  }),
]);

export type SendSmsInput = z.infer<typeof sendSmsSchema>;

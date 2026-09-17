import { z } from "zod";

export const createUserSchema = z.object({
  role: z.enum(["teacher", "parent"]),
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().optional().or(z.literal("")),
  date_of_birth: z.string().trim().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  address: z.string().trim().optional().or(z.literal("")),
  subject: z.string().trim().optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateProfileFieldsSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  date_of_birth: z.string().trim().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  address: z.string().trim().optional().or(z.literal("")),
  subject: z.string().trim().optional().or(z.literal("")),
});

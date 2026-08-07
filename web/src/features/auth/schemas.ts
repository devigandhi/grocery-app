import { z } from "zod";

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number"),
  password: z.string().min(1, "Password is required"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterForm = z.infer<typeof registerSchema>;

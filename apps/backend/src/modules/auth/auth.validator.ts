import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(72), // 72 = bcrypt's input limit
});

export type RegisterInput = z.infer<typeof registerSchema>;

// auth.validator.ts (add to existing file)
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // don't leak password rules here, just "required"
});

export type LoginInput = z.infer<typeof loginSchema>;

// auth.validator.ts (add to existing file)
export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

// auth.validator.ts (add to existing file)
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

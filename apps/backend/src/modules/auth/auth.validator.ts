import { z } from 'zod';

// Strong password validation
// Requirements: 8-72 chars, uppercase, lowercase, number
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long (bcrypt limit is 72 characters)')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .superRefine((password, ctx) => {
    // Prevent overly simple patterns
    if (/(.)\1{5,}/.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password cannot contain the same character 6 times in a row',
      });
    }
  });

// Name validation
// Requirements: 2-100 chars, letters/spaces/apostrophes only
const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((name) => name.trim()); // Trim whitespace

// Email validation
// Normalize to lowercase for consistency
const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email is too long') // RFC 5321
  .transform((email) => email.toLowerCase());

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  // Don't leak password requirements here
  // Just require it's not empty
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  // Token from email link
  token: z
    .string()
    .min(1, 'Verification token is required')
    .regex(/^[a-f0-9]+$/, 'Invalid token format'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required')
    .regex(/^[a-f0-9]+$/, 'Invalid token format'),
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

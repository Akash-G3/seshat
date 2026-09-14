// src/modules/auth/auth.validator.ts
import { z } from 'zod';

/**
 * ==================== SHARED VALIDATORS ====================
 * Reusable validation schemas
 */

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
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .transform((name) => name.trim()); // Trim whitespace

// Email validation
// Normalize to lowercase for consistency
const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email is too long') // RFC 5321
  .transform((email) => email.toLowerCase());

/**
 * ==================== REGISTRATION ====================
 */
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * ==================== LOGIN ====================
 */
export const loginSchema = z.object({
  email: emailSchema,
  // Don't leak password requirements here
  // Just require it's not empty
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * ==================== EMAIL VERIFICATION ====================
 */
export const verifyEmailSchema = z.object({
  // Token from email link
  token: z
    .string()
    .min(1, 'Verification token is required')
    .regex(/^[a-f0-9]+$/, 'Invalid token format'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * ==================== RESEND VERIFICATION EMAIL ====================
 */
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

/**
 * ==================== FORGOT PASSWORD ====================
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * ==================== RESET PASSWORD ====================
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required')
    .regex(/^[a-f0-9]+$/, 'Invalid token format'),
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * ==================== VALIDATION NOTES ====================
 * 
 * Password Requirements:
 * - Minimum 8 characters (NIST recommendation)
 * - Maximum 72 characters (bcrypt limit)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - No repeated characters 6+ times in a row
 * 
 * Email:
 * - Valid RFC 5321 format
 * - Normalized to lowercase
 * - Maximum 254 characters (RFC 5321)
 * 
 * Name:
 * - 2-100 characters
 * - Letters, spaces, hyphens, apostrophes only
 * - Trimmed of leading/trailing whitespace
 * 
 * Token Format:
 * - Hexadecimal string (32 bytes = 64 hex chars)
 * - Generated with crypto.randomBytes()
 */

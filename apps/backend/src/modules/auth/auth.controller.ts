// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} from './auth.service';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from './auth.validator';

/**
 * ==================== REGISTER ====================
 * POST /api/auth/register
 * 
 * Body:
 *   - name: string (2-100 chars, letters/spaces/apostrophes)
 *   - email: string (valid email)
 *   - password: string (8-72 chars, uppercase, lowercase, number)
 * 
 * Response (201):
 *   - user: { id, name, email, isVerified }
 *   - message: "Registration successful..."
 * 
 * If email verification is enabled:
 *   - User will receive verification email
 *   - User cannot login until verified
 */
export async function register(req: Request, res: Response) {
  const { name, email, password } = registerSchema.parse(req.body);

  const user = await registerUser(name, email, password);

  const message = user.isVerified
    ? 'Registration successful. You can now log in.'
    : 'Registration successful. Please check your email to verify your account.';

  return res.status(201).json({
    success: true,
    message,
    data: { user },
  });
}

/**
 * ==================== LOGIN ====================
 * POST /api/auth/login
 * 
 * Body:
 *   - email: string
 *   - password: string
 * 
 * Response (200):
 *   - user: { id, email, name, isVerified }
 *   - Cookies: accessToken (15 min), refreshToken (7 days)
 * 
 * Errors:
 *   - 401: Invalid credentials
 *   - 403: Email not verified (if required)
 */
export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const { accessToken, refreshToken, user } = await loginUser(email, password);

  // Set access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  // Set refresh token cookie (7 days, restricted path)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: { user },
  });
}

/**
 * ==================== REFRESH TOKENS ====================
 * POST /api/auth/refresh
 * 
 * Cookies:
 *   - refreshToken: (in request cookies)
 * 
 * Response (200):
 *   - Cookies: new accessToken and refreshToken
 * 
 * Security:
 *   - Implements token rotation
 *   - Detects token reuse (theft indicator)
 *   - Revokes all sessions on suspicious activity
 */
export async function refresh(req: Request, res: Response) {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token provided',
    });
  }

  const { accessToken, refreshToken } = await refreshTokens(incomingToken);

  // Update access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  // Update refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });

  return res.status(200).json({
    success: true,
    message: 'Tokens refreshed',
  });
}

/**
 * ==================== LOGOUT ====================
 * POST /api/auth/logout
 * 
 * Cookies:
 *   - refreshToken: (in request cookies)
 * 
 * Response (200):
 *   - Clears all auth cookies
 * 
 * Security:
 *   - Revokes refresh token in database
 *   - Prevents token reuse after logout
 */
export async function logout(req: Request, res: Response) {
  const incomingToken = req.cookies.refreshToken;

  await logoutUser(incomingToken);

  // Clear auth cookies
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * ==================== VERIFY EMAIL ====================
 * GET /api/auth/verify-email?token=<token>
 * 
 * Query:
 *   - token: string (from email link)
 * 
 * Response (200):
 *   - User is now verified
 *   - Can login immediately
 * 
 * Errors:
 *   - 400: Invalid token
 *   - 400: Token expired (suggests resending)
 * 
 * Flow:
 * 1. User clicks link in email (automatically includes token)
 * 2. Frontend calls this endpoint
 * 3. User's email is verified in database
 * 4. User can now login
 */
export async function verifyEmailHandler(req: Request, res: Response) {
  const { token } = verifyEmailSchema.parse(req.query);

  await verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
  });
}

/**
 * ==================== RESEND VERIFICATION EMAIL ====================
 * POST /api/auth/resend-verification
 * 
 * Body:
 *   - email: string
 * 
 * Response (200):
 *   - A new verification email will be sent
 * 
 * Rate limiting:
 *   - Max 3 requests per 15 minutes
 *   - Prevents spam
 * 
 * Errors:
 *   - 400: Email already verified
 *   - 429: Too many requests
 * 
 * Use case:
 * - User didn't receive first email
 * - User lost/deleted the email
 * - User wants to use different email
 */
export async function resendVerificationEmailHandler(req: Request, res: Response) {
  const { email } = resendVerificationSchema.parse(req.body);

  await resendVerificationEmail(email);

  return res.status(200).json({
    success: true,
    message: 'If an account exists with that email and is not verified, a verification link has been sent.',
  });
}

/**
 * ==================== FORGOT PASSWORD ====================
 * POST /api/auth/forgot-password
 * 
 * Body:
 *   - email: string
 * 
 * Response (200):
 *   - If account exists, reset email is sent
 *   - Response is same regardless (privacy)
 * 
 * Use case:
 * - User forgot their password
 * - User clicks "Forgot password" link on login
 * - Email with reset link is sent
 */
export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);

  await requestPasswordReset(email);

  // Same response regardless of whether email exists
  // This prevents email enumeration attacks
  return res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
  });
}

/**
 * ==================== RESET PASSWORD ====================
 * POST /api/auth/reset-password
 * 
 * Body:
 *   - token: string (from email link)
 *   - newPassword: string (8-72 chars, uppercase, lowercase, number)
 * 
 * Response (200):
 *   - Password updated
 *   - All existing sessions revoked (user must login again)
 * 
 * Errors:
 *   - 400: Invalid token
 *   - 400: Token expired
 *   - 400: Token already used
 * 
 * Security:
 * - One-time use token
 * - Invalidates all active sessions
 * - User must login with new password
 */
export async function resetPasswordHandler(req: Request, res: Response) {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);

  await resetPassword(token, newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.',
  });
}

// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  verifyEmailHandler,
  resendVerificationEmailHandler,
  forgotPassword,
  resetPasswordHandler,
} from './auth.controller';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

/**
 * ==================== AUTHENTICATION ENDPOINTS ====================
 */

/**
 * POST /api/auth/register
 * Create new user account
 */
router.post('/register', asyncHandler(register));

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login', asyncHandler(login));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(refresh));

/**
 * POST /api/auth/logout
 * Revoke refresh token and end session
 */
router.post('/logout', asyncHandler(logout));

/**
 * ==================== EMAIL VERIFICATION ENDPOINTS ====================
 */

/**
 * GET /api/auth/verify-email?token=<token>
 * Verify user email with token from email link
 */
router.get('/verify-email', asyncHandler(verifyEmailHandler));

/**
 * POST /api/auth/resend-verification
 * Request a new verification email
 * 
 * Rate limited to 3 requests per 15 minutes
 */
router.post('/resend-verification', asyncHandler(resendVerificationEmailHandler));

/**
 * ==================== PASSWORD RESET ENDPOINTS ====================
 */

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', asyncHandler(forgotPassword));

/**
 * POST /api/auth/reset-password
 * Reset password with token from email
 */
router.post('/reset-password', asyncHandler(resetPasswordHandler));

export default router;

/**
 * ==================== ENDPOINT SUMMARY ====================
 * 
 * PUBLIC ENDPOINTS (no auth required):
 * - POST /register - Create account
 * - POST /login - Login
 * - POST /refresh - Get new tokens
 * - GET /verify-email - Verify email
 * - POST /resend-verification - Resend verification
 * - POST /forgot-password - Request password reset
 * - POST /reset-password - Complete password reset
 * - POST /logout - Logout (optional auth)
 * 
 * PROTECTED ENDPOINTS (require auth):
 * - (Typically in other modules)
 */

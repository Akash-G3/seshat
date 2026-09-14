// src/modules/auth/auth.service.ts
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../../shared/utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../shared/utils/email';
import { workspaceService } from '../workspace/workspace.service';
import { AppError } from '../../shared/errors/appError';

/**
 * ==================== REGISTRATION ====================
 * User registration with email verification (conditional)
 * 
 * Flow:
 * 1. Validate email doesn't exist
 * 2. Hash password
 * 3. Create user (isVerified = !ENABLE_EMAIL_VERIFICATION)
 * 4. Create default workspace
 * 5. If email verification enabled: send verification email
 */
export async function registerUser(name: string, email: string, password: string) {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existingUser) {
    throw new AppError('This email is already registered', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  // In production: isVerified = false (user must verify email first)
  // In development: isVerified = true (skip verification step)
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: !env.ENABLE_EMAIL_VERIFICATION,
    },
  });

  // Create default workspace for user
  await workspaceService.create(user.id, `${name.trim()}'s Workspace`);

  // Send verification email if enabled
  if (env.ENABLE_EMAIL_VERIFICATION) {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await sendVerificationEmail(user.email, verificationToken);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  };
}

/**
 * ==================== LOGIN ====================
 * User login with email verification check
 * 
 * Flow:
 * 1. Find user by email
 * 2. Verify password
 * 3. Check if email is verified (if enabled)
 * 4. Create access & refresh tokens
 * 5. Store refresh token in DB
 */
export async function loginUser(email: string, password: string) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check email verification (if enabled)
  if (env.ENABLE_EMAIL_VERIFICATION && !user.isVerified) {
    throw new AppError(
      'Please verify your email before logging in. Check your inbox for the verification link.',
      403
    );
  }

  // Create access token
  const accessToken = signAccessToken({ userId: user.id });

  // Create refresh token record
  const refreshTokenRecord = await prisma.refreshToken.create({
    data: {
      token: 'placeholder', // Will be updated below
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Generate and sign refresh token
  const refreshToken = signRefreshToken({
    userId: user.id,
    tokenId: refreshTokenRecord.id,
  });

  // Update refresh token record with actual token
  await prisma.refreshToken.update({
    where: { id: refreshTokenRecord.id },
    data: { token: refreshToken },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    },
  };
}

/**
 * ==================== REFRESH TOKENS ====================
 * Rotate refresh token and issue new access token
 * 
 * Security:
 * - Detects token reuse (prevents token theft)
 * - Revokes all sessions on suspicious activity
 * - Implements token rotation
 */
export async function refreshTokens(incomingToken: string) {
  // Verify refresh token signature
  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Find token record
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
  });

  if (!tokenRecord || tokenRecord.token !== incomingToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Check if token was already revoked (indicates token theft)
  if (tokenRecord.revoked) {
    // Revoke all sessions for this user as a security precaution
    await prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId },
      data: { revoked: true },
    });
    throw new AppError('Session compromised. Please log in again.', 401);
  }

  // Check if token expired
  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token expired', 401);
  }

  // Revoke old token (token rotation)
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true },
  });

  // Create new access token
  const newAccessToken = signAccessToken({ userId: tokenRecord.userId });

  // Create new refresh token record
  const newTokenRecord = await prisma.refreshToken.create({
    data: {
      token: 'placeholder',
      userId: tokenRecord.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Sign new refresh token
  const newRefreshToken = signRefreshToken({
    userId: tokenRecord.userId,
    tokenId: newTokenRecord.id,
  });

  // Update record with actual token
  await prisma.refreshToken.update({
    where: { id: newTokenRecord.id },
    data: { token: newRefreshToken },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * ==================== LOGOUT ====================
 * Revoke refresh token on logout
 */
export async function logoutUser(incomingToken: string | undefined) {
  if (!incomingToken) return;

  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    return; // Token is invalid/expired, nothing to revoke
  }

  await prisma.refreshToken.updateMany({
    where: { id: payload.tokenId, revoked: false },
    data: { revoked: true },
  });
}

/**
 * ==================== EMAIL VERIFICATION ====================
 * Verify user email with token from email link
 * 
 * Flow:
 * 1. Find verification token
 * 2. Check if not expired
 * 3. Mark user as verified (atomic transaction)
 * 4. Delete token (one-time use)
 */
export async function verifyEmail(token: string) {
  // Find token
  const tokenRecord = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    throw new AppError('Invalid verification link', 400);
  }

  // Check if expired
  if (tokenRecord.expiresAt < new Date()) {
    // Delete expired token
    await prisma.emailVerificationToken.delete({
      where: { id: tokenRecord.id },
    });
    throw new AppError(
      'Verification link has expired. Please request a new one.',
      400
    );
  }

  // Mark user as verified and delete token (atomic transaction)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isVerified: true },
    }),
    prisma.emailVerificationToken.delete({
      where: { id: tokenRecord.id },
    }),
  ]);
}

/**
 * ==================== RESEND VERIFICATION EMAIL ====================
 * Allow user to request a new verification email
 * 
 * Rate limiting:
 * - Max 3 requests per 15 minutes
 * - Prevents email spam
 * 
 * Prevents:
 * - Sending email to already verified users
 * - Multiple concurrent tokens
 */
export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Don't reveal if email exists (privacy)
  if (!user) {
    return; // Silently succeed
  }

  // User already verified, no need to send email
  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Check rate limit: max 3 requests per 15 minutes
  const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 3;

  const recentRequests = await prisma.emailVerificationToken.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: new Date(Date.now() - RATE_LIMIT_WINDOW),
      },
    },
  });

  if (recentRequests.length >= MAX_REQUESTS) {
    throw new AppError(
      'Too many verification requests. Please try again in 15 minutes.',
      429
    );
  }

  // Delete old verification tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });

  // Create new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await prisma.emailVerificationToken.create({
    data: {
      token: verificationToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Send verification email
  await sendVerificationEmail(user.email, verificationToken);
}

/**
 * ==================== PASSWORD RESET ====================
 * Request password reset with email token
 * 
 * Flow:
 * 1. Find user by email
 * 2. Create reset token
 * 3. Send reset email (silently if user not found - privacy)
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Don't reveal if email exists (prevent account enumeration)
  if (!user) {
    return; // Silently succeed
  }

  // Delete old password reset tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  // Create new reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      token: resetToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // Send reset email
  await sendPasswordResetEmail(user.email, resetToken);
}

/**
 * ==================== RESET PASSWORD ====================
 * Complete password reset with token
 * 
 * Flow:
 * 1. Find reset token
 * 2. Validate token is not expired and not used
 * 3. Hash new password
 * 4. Update password and mark token as used (atomic)
 * 5. Revoke all refresh tokens (invalidate all sessions)
 */
export async function resetPassword(token: string, newPassword: string) {
  // Find token
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    throw new AppError('Invalid password reset link', 400);
  }

  // Check if already used (one-time use)
  if (tokenRecord.used) {
    throw new AppError('This password reset link has already been used', 400);
  }

  // Check if expired
  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Password reset link has expired. Please request a new one.', 400);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and mark token as used (atomic transaction)
  // Also revoke all existing refresh tokens to invalidate sessions
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    }),
    // Revoke all refresh tokens (security: user must log in again)
    prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId, revoked: false },
      data: { revoked: true },
    }),
  ]);
}

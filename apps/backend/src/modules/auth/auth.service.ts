
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { hashPassword } from '../../shared/utils/password';
import { AppError } from '../../shared/errors/appError'; // your existing error middleware types
import { comparePassword } from '../../shared/utils/password';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../../shared/utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../shared/utils/email';


export async function registerUser(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = crypto.randomBytes(32).toString('hex');

  await prisma.emailVerificationToken.create({
    data: {
      token: verificationToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  // TODO (Step 10): send verificationToken via email
  await sendVerificationEmail(user.email, verificationToken);

  return { id: user.id, email: user.email };
}


export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  const accessToken = signAccessToken({ userId: user.id });

  const refreshTokenRecord = await prisma.refreshToken.create({
    data: {
      token: crypto.randomBytes(40).toString('hex'), // placeholder, replaced below
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    tokenId: refreshTokenRecord.id,
  });

  // store the actual JWT string (or a hash of it) in the DB row
  await prisma.refreshToken.update({
    where: { id: refreshTokenRecord.id },
    data: { token: refreshToken },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email },
  };
}

export async function refreshTokens(incomingToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
  });

  if (!tokenRecord || tokenRecord.token !== incomingToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (tokenRecord.revoked) {
    // Reuse of an already-rotated token — likely theft.
    // Revoke ALL of this user's refresh tokens as a precaution.
    await prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId },
      data: { revoked: true },
    });
    throw new AppError('Session invalid — please log in again', 401);
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token expired', 401);
  }

  // Rotation: revoke the old token, issue a new one
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true },
  });

  const newAccessToken = signAccessToken({ userId: tokenRecord.userId });

  const newTokenRecord = await prisma.refreshToken.create({
    data: {
      token: 'placeholder',
      userId: tokenRecord.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const newRefreshToken = signRefreshToken({
    userId: tokenRecord.userId,
    tokenId: newTokenRecord.id,
  });

  await prisma.refreshToken.update({
    where: { id: newTokenRecord.id },
    data: { token: newRefreshToken },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}


export async function logoutUser(incomingToken: string | undefined) {
  if (!incomingToken) return; // nothing to do, already "logged out"

  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    return; // invalid/expired token — nothing meaningful to revoke
  }

  await prisma.refreshToken.updateMany({
    where: { id: payload.tokenId, revoked: false },
    data: { revoked: true },
  });
}

// auth.service.ts (add to existing file)
export async function verifyEmail(token: string) {
  const tokenRecord = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    throw new AppError('Invalid verification token', 400);
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Verification token has expired', 400);
  }

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

// auth.service.ts (add to existing file)
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately do nothing different if user doesn't exist — see explanation below
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');

  await prisma.passwordResetToken.create({
    data: {
      token: resetToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  await sendPasswordResetEmail(user.email, resetToken);
}

// auth.service.ts (add to existing file)
export async function resetPassword(token: string, newPassword: string) {
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!tokenRecord || tokenRecord.used) {
    throw new AppError('Invalid or already-used reset token', 400);
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Reset token has expired', 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    }),
    // Security best practice: invalidate all existing sessions on password change
    prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId, revoked: false },
      data: { revoked: true },
    }),
  ]);
}
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
import { env } from '../../config/env';

// Auth cookies need different SameSite behavior depending on deployment.
// Localhost frontend/backend are same-site, so Lax is sufficient.
// A deployed frontend and backend may be on different sites, so production
// uses None + Secure for credentialed cross-site requests.
const isProduction = env.NODE_ENV === 'production';
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
};

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_COOKIE_MAX_AGE,
    path: '/',
  });

  // Keep the refresh token limited to auth endpoints instead of exposing it
  // on every backend request. `/api/auth` includes `/api/auth/refresh`.
  res.cookie('refreshToken', refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/auth',
  });
}

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

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const { accessToken, refreshToken, user } = await loginUser(email, password);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: { user },
  });
}

export async function refresh(req: Request, res: Response) {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token provided',
    });
  }

  const { accessToken, refreshToken } = await refreshTokens(incomingToken);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Tokens refreshed',
  });
}

export async function logout(req: Request, res: Response) {
  const incomingToken = req.cookies.refreshToken;

  await logoutUser(incomingToken);

  res.clearCookie('accessToken', {
    ...authCookieOptions,
    path: '/',
  });
  res.clearCookie('refreshToken', {
    ...authCookieOptions,
    path: '/api/auth',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function verifyEmailHandler(req: Request, res: Response) {
  const { token } = verifyEmailSchema.parse(req.query);

  await verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
  });
}

export async function resendVerificationEmailHandler(req: Request, res: Response) {
  const { email } = resendVerificationSchema.parse(req.body);

  await resendVerificationEmail(email);

  return res.status(200).json({
    success: true,
    message: 'If an account exists with that email and is not verified, a verification link has been sent.',
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);

  await requestPasswordReset(email);

  return res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
  });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);

  await resetPassword(token, newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.',
  });
}

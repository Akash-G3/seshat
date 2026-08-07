// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { registerSchema } from './auth.validator';
import { registerUser } from './auth.service';
import { loginSchema } from './auth.validator';
import { loginUser, logoutUser } from './auth.service';
import { refreshTokens } from './auth.service';
import { forgotPasswordSchema, resetPasswordSchema } from './auth.validator';
import { requestPasswordReset, resetPassword } from './auth.service';

export async function register(req: Request, res: Response) {
  const {name, email, password } = registerSchema.parse(req.body);

  const user = await registerUser(name, email, password);

  return res.status(201).json({ success: true, data: { user } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const { accessToken, refreshToken, user } = await loginUser(email, password);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });

  return res.status(200).json({ success: true, data: { user } });
}

export async function refresh(req: Request, res: Response) {
  const incomingToken = req.cookies.refreshToken;
  if (!incomingToken) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  const { accessToken, refreshToken } = await refreshTokens(incomingToken);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });

  return res.status(200).json({ success: true, message: 'Tokens refreshed' });
}

export async function logout(req: Request, res: Response) {
  const incomingToken = req.cookies.refreshToken;

  await logoutUser(incomingToken);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  return res.status(200).json({ success: true, message: 'Logged out' });
}

// auth.controller.ts (add to existing file)
import { verifyEmailSchema } from './auth.validator';
import { verifyEmail } from './auth.service';

export async function verifyEmailHandler(req: Request, res: Response) {
  const { token } = verifyEmailSchema.parse(req.query); // usually a GET link from email

  await verifyEmail(token);

  return res.status(200).json({ success: true, message: 'Email verified successfully' });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);

  await requestPasswordReset(email);

  // Same response regardless of whether the email exists — see explanation below
  return res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a reset link has been sent',
  });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);

  await resetPassword(token, newPassword);

  return res.status(200).json({ success: true, message: 'Password reset successfully' });
}
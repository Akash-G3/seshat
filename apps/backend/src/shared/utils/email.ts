import { Resend } from 'resend';
import { env } from '../../config/env';

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = 'Your App <onboarding@yourdomain.com>'; // must be a verified domain in Resend

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Verify your email',
    html: `
      <p>Welcome! Please verify your email to activate your account.</p>
      <p><a href="${verificationUrl}">Click here to verify your email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

// src/utils/email.ts (add to existing file)
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your password',
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

import { Resend } from 'resend';

import { env } from '../../config/env';
import logger from './logger';

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = env.RESEND_FROM_EMAIL;
const APP_NAME = 'Seshat';
const SUPPORT_EMAIL = 'thisisakash481@gmail.com';

async function sendEmail(options: { to: string; subject: string; html: string; text?: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      logger.error('Resend rejected email', {
        to: options.to,
        subject: options.subject,
        error,
      });

      throw new Error(error.message);
    }

    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      emailId: data?.id,
    });

    return data;
  } catch (error) {
    logger.error('Email sending failed', {
      to: options.to,
      subject: options.subject,
      error,
    });

    throw error;
  }
}

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const expiryHours = 24;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">

        <style>
          body {
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              "Helvetica Neue",
              Arial,
              sans-serif;

            line-height: 1.6;
            color: #333;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }

          .header {
            background: linear-gradient(
              135deg,
              #667eea 0%,
              #764ba2 100%
            );

            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }

          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }

          .button {
            background: #0f152e;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
          }

          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }

          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header">
            <h1>Welcome to ${APP_NAME}!</h1>
          </div>

          <div class="content">

            <p>Hi there,</p>

            <p>
              Thank you for signing up.
              To get started, please verify your email address
              by clicking the button below:
            </p>

            <div style="text-align: center;">
              <a
                href="${verificationUrl}"
                class="button"
              >
                Verify Your Email
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Or copy and paste this link in your browser:
            </p>

            <p
              style="
                background: #f3f4f6;
                padding: 10px;
                border-radius: 4px;
                word-break: break-all;
                font-size: 12px;
              "
            >
              <code>${verificationUrl}</code>
            </p>

            <div class="warning">
              <strong>
                ⏰ Link expires in ${expiryHours} hours
              </strong>

              <p style="margin: 5px 0 0 0;">
                If you didn't create this account,
                you can ignore this email.
              </p>
            </div>

            <p>
              If you have any questions, feel free to reach out
              to our support team at
              <a href="mailto:${SUPPORT_EMAIL}">
                ${SUPPORT_EMAIL}
              </a>.
            </p>

            <p>
              Best regards,<br>
              <strong>${APP_NAME} Team</strong>
            </p>

            <div class="footer">
              <p>
                © 2026 ${APP_NAME}. All rights reserved.
              </p>

              <p>
                This is an automated message,
                please do not reply to this email.
              </p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to ${APP_NAME}!

Thank you for signing up.

To verify your email, click the link below:

${verificationUrl}

This link expires in ${expiryHours} hours.

If you didn't create this account, you can ignore this email.

For support, contact:
${SUPPORT_EMAIL}

Best regards,
${APP_NAME} Team
  `.trim();

  return sendEmail({
    to,
    subject: `Verify your ${APP_NAME} email`,
    html: htmlContent,
    text: textContent,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const expiryHours = 1;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">

        <style>
          body {
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              "Helvetica Neue",
              Arial,
              sans-serif;

            line-height: 1.6;
            color: #333;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }

          .header {
            background: linear-gradient(
              135deg,
              #667eea 0%,
              #764ba2 100%
            );

            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }

          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }

          .button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
          }

          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }

          .warning {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header">
            <h1>Reset Your Password</h1>
          </div>

          <div class="content">

            <p>Hi,</p>

            <p>
              We received a request to reset the password
              for your ${APP_NAME} account.
              Click the button below to create a new password:
            </p>

            <div style="text-align: center;">
              <a
                href="${resetUrl}"
                class="button"
              >
                Reset Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Or copy and paste this link in your browser:
            </p>

            <p
              style="
                background: #f3f4f6;
                padding: 10px;
                border-radius: 4px;
                word-break: break-all;
                font-size: 12px;
              "
            >
              <code>${resetUrl}</code>
            </p>

            <div class="warning">

              <strong>
                ⏰ Link expires in ${expiryHours} hour
              </strong>

              <p style="margin: 5px 0 0 0;">
                <strong>For your security:</strong>
                If you didn't request a password reset,
                please ignore this email or contact support.
              </p>

            </div>

            <h3>Security Tips:</h3>

            <ul>
              <li>
                Never share your password reset link with anyone.
              </li>

              <li>
                Always make sure you're on ${APP_NAME}'s official website.
              </li>

              <li>
                Use a strong password with uppercase,
                lowercase and numbers.
              </li>
            </ul>

            <p>
              If you have any questions, contact our support team at
              <a href="mailto:${SUPPORT_EMAIL}">
                ${SUPPORT_EMAIL}
              </a>.
            </p>

            <p>
              Best regards,<br>
              <strong>${APP_NAME} Team</strong>
            </p>

            <div class="footer">
              <p>
                © 2026 ${APP_NAME}. All rights reserved.
              </p>

              <p>
                This is an automated message,
                please do not reply to this email.
              </p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Reset Your Password

We received a request to reset the password for your ${APP_NAME} account.

Click the link below to create a new password:

${resetUrl}

This link expires in ${expiryHours} hour.

For your security:
If you didn't request a password reset,
please ignore this email or contact support.

Security Tips:
- Never share your password reset link with anyone.
- Always make sure you're on ${APP_NAME}'s official website.
- Use a strong password with uppercase, lowercase and numbers.

For support, contact:
${SUPPORT_EMAIL}

Best regards,
${APP_NAME} Team
  `.trim();

  return sendEmail({
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: htmlContent,
    text: textContent,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">

        <style>
          body {
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              "Helvetica Neue",
              Arial,
              sans-serif;

            line-height: 1.6;
            color: #333;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }

          .header {
            background: linear-gradient(
              135deg,
              #667eea 0%,
              #764ba2 100%
            );

            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }

          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }

          .button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
          }

          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header">
            <h1>Welcome to ${APP_NAME}!</h1>
          </div>

          <div class="content">

            <p>Hi ${name},</p>

            <p>
              Your email has been verified and your account
              is all set!
            </p>

            <p>
              You can now log in and start using ${APP_NAME}.
            </p>

            <div style="text-align: center;">
              <a
                href="${env.CLIENT_URL}"
                class="button"
              >
                Go to ${APP_NAME}
              </a>
            </div>

            <p>
              If you have any questions or need help getting started,
              don't hesitate to reach out at
              <a href="mailto:${SUPPORT_EMAIL}">
                ${SUPPORT_EMAIL}
              </a>.
            </p>

            <p>
              Happy to have you on board!
            </p>

            <p>
              Best regards,<br>
              <strong>${APP_NAME} Team</strong>
            </p>

            <div class="footer">
              <p>
                © 2026 ${APP_NAME}. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Welcome to ${APP_NAME}!`,
    html: htmlContent,
  });
}

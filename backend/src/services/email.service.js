import { env } from '../config/env.js';

export const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  if (env.nodeEnv === 'production') {
    // Replace with your email provider (e.g. SendGrid, SES, Nodemailer).
    console.warn('Password reset email delivery is not configured for production.');
    return;
  }

  console.info(`[dev] Password reset link for ${email}: ${resetUrl}`);
};

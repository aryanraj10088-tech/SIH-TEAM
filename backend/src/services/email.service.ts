import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Setup transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
};

const getFrom = () => process.env.EMAIL_FROM || 'noreply@srijansetu.com';

/**
 * Generate a 6-digit cryptographically secure OTP
 */
export const generateOTP = (): string => {
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
};

/**
 * Generate a secure random token for invitations
 */
export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send OTP Email for Public Signup
 */
export const sendOtpEmail = async (email: string, otp: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const isSpecialEmail = normalizedEmail === 'ishitakumari550@gmail.com' || 
                         normalizedEmail === '2025021230.mmmut.ac.in' || 
                         normalizedEmail === '2025021230@mmmut.ac.in';

  const specialGreetingText = isSpecialEmail ? 'HI SHORTYYYY 🤓🤓🤓\n\n' : '';
  const specialGreetingHtml = isSpecialEmail ? '<h2 style="color: #4F46E5; margin-bottom: 20px;">HI SHORTYYYY 🤓🤓🤓</h2>' : '';

  const mailOptions = {
    from: getFrom(),
    to: email,
    subject: 'Your Verification Code',
    text: `${specialGreetingText}Your verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${specialGreetingHtml}
        <h2 style="color: #374151;">Verify your email address</h2>
        <p style="color: #6b7280; font-size: 16px;">Please use the following verification code to complete your signup:</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; color: #4F46E5; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        <hr style="border-color: #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `,
  };

  if (process.env.NODE_ENV !== 'test') {
    try {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send OTP email. Detailed Error:', error);
      // In development, if SMTP is not configured, don't crash, just log it.
      if (process.env.NODE_ENV === 'development') {
        console.warn('DEVELOPMENT: OTP would be sent:', otp);
      } else {
        throw new Error('Failed to send verification email');
      }
    }
  }
};

/**
 * Send Reviewer Invitation Email
 */
export const sendInvitationEmail = async (email: string, token: string) => {
  // Using the frontend URL from Vercel/Vite
  const baseUrl = process.env.FRONTEND_URL || process.env.VITE_API_URL || 'http://localhost:5173';
  const inviteLink = `${baseUrl}/accept-reviewer-invitation?token=${token}`;

  const mailOptions = {
    from: getFrom(),
    to: email,
    subject: "You've been invited as a Reviewer",
    text: `You have been invited to join SrijanSetu as a Reviewer.\n\nClick below to accept your invitation and create your application password:\n${inviteLink}\n\nThis invitation expires in 24 hours.\nIf you did not expect this invitation, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You have been invited to join as a Reviewer</h2>
        <p>Click the button below to accept your invitation and set up your application password.</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
        </div>
        <p style="font-size: 12px; color: #666;">Or copy and paste this link: <br> ${inviteLink}</p>
        <p>This invitation expires in 24 hours.</p>
        <p style="color: #666; font-size: 12px;">If you did not expect this invitation, you can ignore this email.</p>
      </div>
    `,
  };

  if (process.env.NODE_ENV !== 'test') {
    try {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('DEVELOPMENT: Invite Link would be:', inviteLink);
      } else {
        throw new Error('Failed to send invitation email');
      }
    }
  }
};

/**
 * Send Generic Workflow Notification Email (Dual Notification)
 */
export const sendWorkflowNotificationEmail = async (email: string, subject: string, title: string, message: string, linkPath?: string) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.VITE_API_URL || 'http://localhost:5173';
  const actionLink = linkPath ? `${baseUrl}${linkPath}` : baseUrl;

  const mailOptions = {
    from: getFrom(),
    to: email,
    subject: subject,
    text: `${title}\n\n${message}\n\nView details: ${actionLink}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h3 style="color: #111827;">${title}</h3>
        <p style="color: #4B5563; line-height: 1.5;">${message}</p>
        <div style="margin: 20px 0;">
          <a href="${actionLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">View in Application</a>
        </div>
      </div>
    `,
  };

  if (process.env.NODE_ENV !== 'test') {
    try {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }
};

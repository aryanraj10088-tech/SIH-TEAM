import crypto from 'crypto';
import nodemailer from 'nodemailer';

const getFrom = () => process.env.EMAIL_FROM || 'noreply@srijansetu.com';

const logMockEmail = (to: string, subject: string, text: string) => {
  console.log(`\n[DEV MAIL] To: ${to}`);
  console.log(`[DEV MAIL] Subject: ${subject}`);
  console.log(`[DEV MAIL] Body: ${text.replace(/\n/g, ' | ')}`);
};

const sendViaSmtp = async (to: string, subject: string, text: string, html: string) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: getFrom(),
    to,
    subject,
    text,
    html,
  });

  return true;
};

/**
 * Send an email using Brevo (Sendinblue) REST API, with SMTP fallback
 */
const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  if (process.env.NODE_ENV === 'test') return;

  const hasSmtpCredentials = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasBrevoApiKey = !!process.env.BREVO_API_KEY;
  const mockEmailEnabled = process.env.MAIL_MODE === 'mock' || process.env.NODE_ENV === 'development';

  if (process.env.NODE_ENV === 'development' && !hasSmtpCredentials && !hasBrevoApiKey) {
    logMockEmail(to, subject, text);
    return;
  }

  if (process.env.NODE_ENV === 'development' && process.env.MAIL_MODE !== 'real') {
    logMockEmail(to, subject, text);
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn(`BREVO_API_KEY is missing. Trying SMTP fallback for ${to}.`);
    const smtpSent = await sendViaSmtp(to, subject, text, html);
    if (!smtpSent) {
      if (process.env.NODE_ENV === 'development' && mockEmailEnabled) {
        logMockEmail(to, subject, text);
        return;
      }
      throw new Error('BREVO_API_KEY is not configured and no SMTP fallback is available');
    }
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'SrijanSetu',
          email: getFrom()
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Brevo API Error: ${response.status} - ${errorData}`);
    }

    return;
  } catch (error) {
    console.error('Failed to send email via Brevo:', error);

    const smtpSent = await sendViaSmtp(to, subject, text, html).catch((smtpError) => {
      console.error('SMTP fallback also failed:', smtpError);
      return false;
    });

    if (smtpSent) {
      return;
    }

    if (process.env.NODE_ENV === 'development' && process.env.MAIL_MODE !== 'real') {
      console.warn(`DEVELOPMENT: SMTP send failed for ${to}, falling back to local mock OTP flow.`);
      logMockEmail(to, subject, text);
      return;
    }

    throw error;
  }
};

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

  try {
    await sendEmail(email, 'Your Verification Code', `${specialGreetingText}Your verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`, `
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
    `);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV OTP] OTP for ${email}: ${otp}`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && process.env.MAIL_MODE !== 'real') {
      console.warn(`DEVELOPMENT: SMTP send failed, but local OTP flow is active. OTP for ${email}: ${otp}`);
      return;
    }
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send Reviewer Invitation Email
 */
export const sendInvitationEmail = async (email: string, token: string) => {
  // Using the frontend URL from Vercel/Vite
  const baseUrl = process.env.FRONTEND_URL || process.env.VITE_API_URL || 'http://localhost:5173';
  const inviteLink = `${baseUrl}/accept-reviewer-invitation?token=${token}`;

  try {
    await sendEmail(email, "You've been invited as a Reviewer", `You have been invited to join SrijanSetu as a Reviewer.\n\nClick below to accept your invitation and create your application password:\n${inviteLink}\n\nThis invitation expires in 24 hours.\nIf you did not expect this invitation, you can ignore this email.`, `
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
    `);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DEVELOPMENT: Invite Link would be:', inviteLink);
    } else {
      throw new Error('Failed to send invitation email');
    }
  }
};

/**
 * Send Generic Workflow Notification Email (Dual Notification)
 */
export const sendWorkflowNotificationEmail = async (email: string, subject: string, title: string, message: string, linkPath?: string) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.VITE_API_URL || 'http://localhost:5173';
  const actionLink = linkPath ? `${baseUrl}${linkPath}` : baseUrl;

  try {
    await sendEmail(email, subject, `${title}\n\n${message}\n\nView details: ${actionLink}`, `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h3 style="color: #111827;">${title}</h3>
        <p style="color: #4B5563; line-height: 1.5;">${message}</p>
        <div style="margin: 20px 0;">
          <a href="${actionLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">View in Application</a>
        </div>
      </div>
    `);
  } catch (error) {
    // Non-critical background notification failure
  }
};

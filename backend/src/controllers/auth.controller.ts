import { Request, Response } from 'express';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { generateToken } from '../utils/generateToken';
// OTP imports commented out — signup no longer requires email verification.
// Preserved here so they can be restored by simply uncommenting.
// import { generateOTP, sendOtpEmail } from '../services/email.service';
// import crypto from 'crypto';

/**
 * GET /api/auth/google/callback  — called by Passport after Google auth succeeds
 * Issues JWT cookie and redirects browser to the frontend dashboard.
 */
export const googleCallback = (req: Request, res: Response): void => {
  const user = req.user as any;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!user) {
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    return;
  }

  // Issue JWT cookie — identical to email/password login
  generateToken(res, user._id.toString(), user.role);
  res.redirect(`${frontendUrl}/dashboard`);
};


export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.comparePassword(password))) {
      if (!user.isEmailVerified) {
        res.status(403).json({ message: 'Please verify your email before logging in.' });
        return;
      }
      if (user.accountStatus !== 'ACTIVE') {
        res.status(403).json({ message: 'Account is not active.' });
        return;
      }

      generateToken(res, (user._id as any).toString(), user.role);

      await AuditLog.create({
        entityType: 'User',
        entityId: user._id,
        action: 'LOGIN_SUCCESS',
        performedBy: user._id,
        metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      await AuditLog.create({
        entityType: 'User',
        entityId: user ? user._id : undefined,
        action: 'LOGIN_FAILED',
        performedBy: user ? user._id : undefined,
        metadata: { email, ip: req.ip, userAgent: req.get('User-Agent'), reason: 'Invalid credentials' }
      });
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (req.user) {
    await AuditLog.create({
      entityType: 'User',
      entityId: (req.user as any)._id,
      action: 'LOGOUT',
      performedBy: (req.user as any)._id,
      metadata: { ip: req.ip }
    });
  }

  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-passwordHash');
    if (user) {
      const userData = user.toObject();
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Fetch recent activities performed by this user, limit to last 10
    const activities = await AuditLog.find({ performedBy: req.user._id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(activities);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching activity' });
  }
};

import Organization from '../models/Organization';
import Notification from '../models/Notification'; // Assuming Notification model exists

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, accountType, organizationName } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    if (accountType === 'ORGANIZATION' && !organizationName) {
      res.status(400).json({ message: 'Organization name is required' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let finalRole: 'Operator' | 'Reviewer' | 'Administrator' = 'Operator';
    let finalStatus: 'PENDING' | 'ACTIVE' | 'DISABLED' = 'ACTIVE';
    let finalOrgId: mongoose.Types.ObjectId | undefined = undefined;

    if (accountType === 'ORGANIZATION') {
      const org = await Organization.findOne({ name: { $regex: new RegExp(`^${organizationName}$`, 'i') } });
      if (!org) {
        // Creating a new organization makes you an active Administrator
        finalRole = 'Administrator';
        finalStatus = 'ACTIVE';
      } else {
        // Subsequent users become Operator and PENDING approval
        finalRole = 'Operator';
        finalStatus = 'PENDING';
        finalOrgId = org._id as mongoose.Types.ObjectId;
      }
    }

    const isOrg = accountType === 'ORGANIZATION';

    user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: finalRole,
      accountType: isOrg ? 'ORGANIZATION' : 'INDIVIDUAL',
      isEmailVerified: true,
      accountStatus: finalStatus,
      authProvider: 'local',
      otpAttempts: 0,
      organizationId: finalOrgId
    });

    if (accountType === 'ORGANIZATION' && finalStatus === 'ACTIVE' && !finalOrgId) {
      const newOrg = await Organization.create({
        name: organizationName,
        adminId: user._id
      });
      user.organizationId = newOrg._id as any;
      await user.save();
    } else if (accountType === 'ORGANIZATION' && finalOrgId) {
      // Notify Admin
      const org = await Organization.findById(finalOrgId);
      if (org) {
        await Notification.create({
          userId: org.adminId,
          type: 'NEW_USER_SIGNUP',
          message: `${name} has requested to join ${org.name}. Please approve their account.`,
          isRead: false
        });
      }
    }

    await AuditLog.create({
      entityType: 'User',
      entityId: user._id,
      action: 'PUBLIC_SIGNUP',
      performedBy: user._id,
    });

    // If they are pending, do not log them in automatically.
    if (finalStatus === 'PENDING') {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email, // Return original unhashed email
        role: user.role,
        message: 'Signup successful. Please wait for admin approval.'
      });
      return;
    }

    // Issue JWT cookie immediately — user is logged in right after signup
    generateToken(res, (user._id as any).toString(), user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email, // Return original unhashed email
      role: user.role,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server Error during signup' });
  }
};

// ── OTP Controllers (commented out — signup no longer uses OTP verification) ──
// These are preserved in full so they can be restored by uncommenting if needed.
//
// export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
//   const { email, otp } = req.body;
//
//   try {
//     const user = await User.findOne({ email });
//
//     if (!user) {
//       res.status(400).json({ message: 'User not found' });
//       return;
//     }
//
//     if (user.isEmailVerified) {
//       res.status(400).json({ message: 'Email already verified' });
//       return;
//     }
//
//     if (!user.otpHash || !user.otpExpiry) {
//       res.status(400).json({ message: 'No active OTP session' });
//       return;
//     }
//
//     if (user.otpAttempts >= 5) {
//       res.status(429).json({ message: 'Too many attempts. Please resend OTP.' });
//       return;
//     }
//
//     if (new Date() > user.otpExpiry) {
//       res.status(400).json({ message: 'OTP has expired' });
//       return;
//     }
//
//     const providedHash = crypto.createHash('sha256').update(otp).digest('hex');
//
//     if (providedHash !== user.otpHash) {
//       user.otpAttempts += 1;
//       await user.save();
//       res.status(400).json({ message: 'Invalid verification code' });
//       return;
//     }
//
//     // Success
//     user.isEmailVerified = true;
//     user.accountStatus = 'ACTIVE';
//     user.otpHash = undefined;
//     user.otpExpiry = undefined;
//     user.otpAttempts = 0;
//     await user.save();
//
//     await AuditLog.create({
//       entityType: 'User',
//       entityId: user._id,
//       action: 'EMAIL_VERIFIED',
//       performedBy: user._id,
//     });
//
//     res.status(200).json({ message: 'Email verified successfully.' });
//   } catch (error: any) {
//     res.status(500).json({ message: 'Server Error during verification' });
//   }
// };
//
// export const resendOtp = async (req: Request, res: Response): Promise<void> => {
//   const { email } = req.body;
//
//   try {
//     const user = await User.findOne({ email });
//
//     if (!user) {
//       res.status(200).json({ message: 'If an account exists, a new OTP has been sent.' });
//       return;
//     }
//
//     if (user.isEmailVerified) {
//       res.status(400).json({ message: 'Email is already verified.' });
//       return;
//     }
//
//     if (user.otpExpiry && new Date() < new Date(user.otpExpiry.getTime() - 9.58 * 60 * 1000)) {
//       res.status(429).json({ message: 'Please wait before requesting another OTP.' });
//       return;
//     }
//
//     const otp = generateOTP();
//     const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//
//     user.otpHash = otpHash;
//     user.otpExpiry = otpExpiry;
//     user.otpAttempts = 0;
//     await user.save();
//
//     await sendOtpEmail(email, otp);
//
//     res.status(200).json({ message: 'A new verification code has been sent.' });
//   } catch (error: any) {
//     res.status(500).json({ message: 'Server Error during OTP resend' });
//   }
// };

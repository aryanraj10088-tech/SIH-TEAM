import { Request, Response } from 'express';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';
import { generateOTP, sendOtpEmail } from '../services/email.service';
import crypto from 'crypto';
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

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

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-passwordHash');
    if (user) {
      res.json(user);
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

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, accountType } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.isEmailVerified) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      
      // User exists but is not verified. Resend OTP and update password/accountType.
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
      user.accountType = accountType === 'ORGANIZATION' ? 'ORGANIZATION' : 'INDIVIDUAL';
      
      const otp = generateOTP();
      user.otpHash = crypto.createHash('sha256').update(otp).digest('hex');
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      await user.save();
      
      await sendOtpEmail(email, otp);
      res.status(200).json({ message: 'Verification code resent to your email.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user = await User.create({
      name,
      email,
      passwordHash,
      role: 'Operator',
      accountType: accountType === 'ORGANIZATION' ? 'ORGANIZATION' : 'INDIVIDUAL',
      isEmailVerified: false,
      accountStatus: 'PENDING',
      otpHash,
      otpExpiry,
      otpAttempts: 0,
    });

    await sendOtpEmail(email, otp);
    
    await AuditLog.create({
      entityType: 'User',
      entityId: user._id,
      action: 'PUBLIC_SIGNUP',
      performedBy: user._id,
    });

    res.status(201).json({ message: 'Verification code sent to your email.' });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server Error during signup' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    if (!user.otpHash || !user.otpExpiry) {
      res.status(400).json({ message: 'No active OTP session' });
      return;
    }

    if (user.otpAttempts >= 5) {
      res.status(429).json({ message: 'Too many attempts. Please resend OTP.' });
      return;
    }

    if (new Date() > user.otpExpiry) {
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }

    const providedHash = crypto.createHash('sha256').update(otp).digest('hex');
    console.log('--- OTP DEBUG ---');
    console.log('Provided OTP:', otp);
    console.log('Provided Hash:', providedHash);
    console.log('Stored Hash:', user.otpHash);
    console.log('Stored Expiry:', user.otpExpiry);
    console.log('-----------------');

    if (providedHash !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();
      res.status(400).json({ message: 'Invalid verification code' });
      return;
    }

    // Success
    user.isEmailVerified = true;
    user.accountStatus = 'ACTIVE';
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    
    await user.save();

    await AuditLog.create({
      entityType: 'User',
      entityId: user._id,
      action: 'EMAIL_VERIFIED',
      performedBy: user._id,
    });

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error during verification' });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't leak existence of user, just pretend it worked to thwart enumeration
      res.status(200).json({ message: 'If an account exists, a new OTP has been sent.' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified.' });
      return;
    }

    // Rate limit resend (e.g. at least 25 seconds between resends to avoid clock sync issues with the 30s frontend timer)
    if (user.otpExpiry && new Date() < new Date(user.otpExpiry.getTime() - 9.58 * 60 * 1000)) {
      res.status(429).json({ message: 'Please wait before requesting another OTP.' });
      return;
    }

    const otp = generateOTP();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otpHash = otpHash;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    await user.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'A new verification code has been sent.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error during OTP resend' });
  }
};

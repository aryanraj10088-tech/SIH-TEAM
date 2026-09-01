import { Request, Response } from 'express';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const validateInvitation = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    res.status(400).json({ message: 'Missing or invalid token' });
    return;
  }

  try {
    const providedHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ invitationTokenHash: providedHash });

    if (!user || user.role !== 'Reviewer') {
      res.status(404).json({ message: 'Invalid invitation token' });
      return;
    }

    if (user.accountStatus === 'ACTIVE') {
      res.status(400).json({ message: 'Account is already active' });
      return;
    }

    if (!user.invitationExpiry || new Date() > user.invitationExpiry) {
      res.status(400).json({ message: 'Invitation has expired. Please contact your administrator.' });
      return;
    }

    // Return only non-sensitive data needed for the UI
    res.status(200).json({ email: user.email, name: user.name });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error during token validation' });
  }
};

export const acceptInvitation = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ message: 'Missing token or password' });
    return;
  }

  try {
    const providedHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ invitationTokenHash: providedHash });

    if (!user || user.role !== 'Reviewer') {
      res.status(404).json({ message: 'Invalid invitation token' });
      return;
    }

    if (user.accountStatus === 'ACTIVE') {
      res.status(400).json({ message: 'Account is already active' });
      return;
    }

    if (!user.invitationExpiry || new Date() > user.invitationExpiry) {
      res.status(400).json({ message: 'Invitation has expired. Please contact your administrator.' });
      return;
    }

    // Set new password and activate
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user.passwordHash = passwordHash;
    user.isEmailVerified = true;
    user.accountStatus = 'ACTIVE';
    user.invitationTokenHash = undefined;
    user.invitationExpiry = undefined;

    await user.save();

    await AuditLog.create({
      entityType: 'User',
      entityId: user._id,
      action: 'REVIEWER_ACTIVATED',
      performedBy: user._id,
    });

    res.status(200).json({ message: 'Account activated successfully. You may now log in.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error during activation' });
  }
};

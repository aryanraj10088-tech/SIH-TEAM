import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import GeneratedOutput from '../models/GeneratedOutput';
import AuditLog from '../models/AuditLog';
import crypto from 'crypto';
import { generateToken, sendInvitationEmail } from '../services/email.service';

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalOutputs = await GeneratedOutput.countDocuments();
    
    const pendingReviews = await GeneratedOutput.countDocuments({ status: 'PENDING_REVIEW' });
    const approvedOutputs = await GeneratedOutput.countDocuments({ status: 'APPROVED' });
    const rejectedOutputs = await GeneratedOutput.countDocuments({ status: 'REJECTED' });

    res.status(200).json({
      totalUsers,
      totalProjects,
      totalOutputs,
      pendingReviews,
      approvedOutputs,
      rejectedOutputs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system stats' });
  }
};

export const inviteReviewer = async (req: Request, res: Response): Promise<void> => {
  const { name, email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const token = generateToken();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const dummyHash = await crypto.randomBytes(32).toString('hex');

    const reviewer = await User.create({
      name,
      email,
      passwordHash: dummyHash,
      role: 'Reviewer',
      accountType: 'ORGANIZATION',
      isEmailVerified: false,
      accountStatus: 'PENDING',
      invitationTokenHash: tokenHash,
      invitationExpiry: expiry,
    });

    await sendInvitationEmail(email, token);

    await AuditLog.create({
      entityType: 'User',
      entityId: reviewer._id,
      action: 'REVIEWER_INVITED',
      performedBy: req.user?._id,
      metadata: { targetEmail: email },
    });

    res.status(201).json({ message: 'Reviewer invited successfully' });
  } catch (error: any) {
    console.error('Invite error:', error);
    res.status(500).json({ message: 'Failed to invite reviewer' });
  }
};

export const getReviewers = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewers = await User.find({ role: 'Reviewer' }).select('-passwordHash -otpHash -invitationTokenHash');
    res.status(200).json(reviewers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviewers' });
  }
};

export const resendInvitation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const reviewer = await User.findById(id);

    if (!reviewer || reviewer.role !== 'Reviewer') {
      res.status(404).json({ message: 'Reviewer not found' });
      return;
    }

    if (reviewer.accountStatus === 'ACTIVE') {
      res.status(400).json({ message: 'Reviewer is already active' });
      return;
    }

    const token = generateToken();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    reviewer.invitationTokenHash = tokenHash;
    reviewer.invitationExpiry = expiry;
    await reviewer.save();

    await sendInvitationEmail(reviewer.email, token);

    await AuditLog.create({
      entityType: 'User',
      entityId: reviewer._id,
      action: 'REVIEWER_INVITATION_RESENT',
      performedBy: req.user?._id,
    });

    res.status(200).json({ message: 'Invitation resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend invitation' });
  }
};

import { Request, Response } from 'express';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
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

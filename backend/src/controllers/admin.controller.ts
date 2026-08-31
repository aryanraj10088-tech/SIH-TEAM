import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import GeneratedOutput from '../models/GeneratedOutput';

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

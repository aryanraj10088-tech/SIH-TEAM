import { Request, Response } from 'express';
import User from '../models/User';

export const searchReviewers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    if (!search || typeof search !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const reviewers = await User.find({
      role: 'Reviewer',
      email: { $regex: search, $options: 'i' }
    }).select('_id name email role').limit(10); // Added limit to prevent massive payload

    res.status(200).json(reviewers);
  } catch (err: any) {
    res.status(500).json({ message: 'Error searching reviewers' });
  }
};

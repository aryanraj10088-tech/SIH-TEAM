import { Request, Response } from 'express';
import mongoose from 'mongoose';
import GeneratedOutput from '../models/GeneratedOutput';
import AuditLog from '../models/AuditLog';
import Project from '../models/Project';
import Notification from '../models/Notification';

// Helper to check project ownership
const checkProjectOwnership = async (projectId: string, userId: string | undefined) => {
  if (!userId) return { error: 'Not authenticated', status: 401 };
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };
  
  if (project.ownerId.toString() !== userId) return { error: 'Not authorized for this project', status: 403 };
  return { project, error: null };
};

export const createOutput = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, sourceId, format, content } = req.body;

    const { error, status } = await checkProjectOwnership(projectId, req.user?._id?.toString());
    if (error) {
      res.status(status as number).json({ message: error });
      return;
    }

    const output = await GeneratedOutput.create({
      projectId,
      sourceId,
      format,
      content,
      createdBy: req.user?._id,
      status: 'DRAFT'
    });

    await AuditLog.create({
      entityType: 'GeneratedOutput',
      entityId: output._id,
      action: 'CREATED',
      performedBy: req.user?._id,
      metadata: { format }
    });

    res.status(201).json(output);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating output' });
  }
};

export const getOutputs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ message: 'projectId query param is required' });
      return;
    }

    const { error, status } = await checkProjectOwnership(projectId as string, req.user?._id?.toString());
    if (error) {
      res.status(status as number).json({ message: error });
      return;
    }

    const outputs = await GeneratedOutput.find({ projectId: projectId as string }).sort({ createdAt: -1 });
    res.status(200).json(outputs);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching outputs' });
  }
};

export const getOutputById = async (req: Request, res: Response): Promise<void> => {
  try {
    const output = await GeneratedOutput.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('reviewerComments.userId', 'name')
      .populate('versions.editedBy', 'name');

    if (!output) {
      res.status(404).json({ message: 'Output not found' });
      return;
    }

    const userId = req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const project = await Project.findById(output.projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isOwner = project.ownerId.toString() === userId;
    const isAssignedReviewer = project.assignedReviewers?.some(id => id.toString() === userId);
    const isPendingReview = output.status === 'PENDING_REVIEW';
    const canReview = ['Administrator', 'Reviewer'].includes(req.user?.role || '');

    // The core privacy logic
    if (isOwner) {
       // Owner can always see their own output
    } else if (canReview && isAssignedReviewer && isPendingReview) {
       // Assigned reviewer/admin can only see it if it's explicitly submitted for review
    } else {
       res.status(403).json({ message: 'Not authorized to access this output' });
       return;
    }

    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching output details' });
  }
};

export const editContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, note } = req.body;
    const output = await GeneratedOutput.findById(req.params.id);

    if (!output) {
      res.status(404).json({ message: 'Output not found' });
      return;
    }

    const { error, status } = await checkProjectOwnership(output.projectId.toString(), req.user?._id?.toString());
    if (error) {
      res.status(status as number).json({ message: error });
      return;
    }
    
    if (output.status === 'APPROVED') {
      res.status(400).json({ message: 'Cannot edit an approved output' });
      return;
    }

    if (output.createdBy.toString() !== req.user?._id?.toString()) {
      res.status(403).json({ message: 'Cannot edit an output you did not create' });
      return;
    }

    if (!req.user?._id) {
       res.status(401).json({ message: 'Not authenticated' });
       return;
    }

    output.versions.push({
      content: output.content,
      editedBy: req.user._id,
      editedAt: new Date(),
      note: note || 'Manual edit'
    });

    output.content = content;
    if (output.status !== 'DRAFT') {
      output.status = 'DRAFT';
    }
    
    await output.save();

    await AuditLog.create({
      entityType: 'GeneratedOutput',
      entityId: output._id,
      action: 'EDITED',
      performedBy: req.user._id,
      metadata: { note }
    });

    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ message: 'Error editing output' });
  }
};

export const submitForReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const output = await GeneratedOutput.findById(req.params.id);
    if (!output) {
      res.status(404).json({ message: 'Output not found' });
      return;
    }

    const { project, error, status } = await checkProjectOwnership(output.projectId.toString(), req.user?._id?.toString());
    if (error) {
      res.status(status as number).json({ message: error });
      return;
    }

    if (output.status !== 'DRAFT') {
      res.status(400).json({ message: 'Only DRAFT outputs can be submitted for review' });
      return;
    }

    output.status = 'PENDING_REVIEW';
    await output.save();

    await AuditLog.create({
      entityType: 'GeneratedOutput',
      entityId: output._id,
      action: 'SUBMITTED_FOR_REVIEW',
      performedBy: req.user?._id
    });

    if (project && project.assignedReviewers && project.assignedReviewers.length > 0) {
      const notifications = project.assignedReviewers.map(reviewerId => ({
        userId: reviewerId,
        type: 'OUTPUT_SUBMITTED',
        message: `An output in project "${project.title}" has been submitted for review.`,
        link: '/pending-reviews'
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ message: 'Error submitting for review' });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    const output = await GeneratedOutput.findById(req.params.id);
    
    if (!output) {
      res.status(404).json({ message: 'Output not found' });
      return;
    }

    const userId = req.user?._id?.toString();
    if (!userId) {
       res.status(401).json({ message: 'Not authenticated' });
       return;
    }

    const project = await Project.findById(output.projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isOwner = project.ownerId.toString() === userId;
    const isAssignedReviewer = project.assignedReviewers?.some(id => id.toString() === userId);
    const isPendingReview = output.status === 'PENDING_REVIEW';
    const canReview = ['Administrator', 'Reviewer'].includes(req.user?.role || '');

    if (isOwner) {
       // Owner can comment
    } else if (canReview && isAssignedReviewer && isPendingReview) {
       // Reviewer can comment
    } else {
       res.status(403).json({ message: 'Not authorized to comment on this output' });
       return;
    }

    output.reviewerComments.push({
      userId: req.user!._id,
      text,
      createdAt: new Date()
    });

    await output.save();

    await AuditLog.create({
      entityType: 'GeneratedOutput',
      entityId: output._id,
      action: 'COMMENT_ADDED',
      performedBy: req.user?._id
    });

    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

export const reviewOutput = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, note } = req.body; 
    
    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Invalid action' });
      return;
    }

    const output = await GeneratedOutput.findById(req.params.id);
    if (!output) {
      res.status(404).json({ message: 'Output not found' });
      return;
    }

    const userId = req.user?._id?.toString();
    if (!userId) {
       res.status(401).json({ message: 'Not authenticated' });
       return;
    }

    const project = await Project.findById(output.projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isAssignedReviewer = project.assignedReviewers?.some(id => id.toString() === userId);
    const canReview = ['Administrator', 'Reviewer'].includes(req.user?.role || '');
    
    if (!canReview || !isAssignedReviewer) {
      res.status(403).json({ message: 'You are not assigned as a Reviewer for this project' });
      return;
    }

    if (output.createdBy.toString() === userId) {
      res.status(403).json({ message: 'Cannot review your own output' });
      return;
    }

    if (output.status !== 'PENDING_REVIEW') {
      res.status(400).json({ message: 'Only PENDING_REVIEW outputs can be approved/rejected' });
      return;
    }

    output.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    output.reviewedBy = req.user?._id;
    output.reviewedAt = new Date();
    output.approvalNote = note;

    await output.save();

    await AuditLog.create({
      entityType: 'GeneratedOutput',
      entityId: output._id,
      action: action === 'approve' ? 'APPROVED' : 'REJECTED',
      performedBy: req.user?._id,
      metadata: { note }
    });

    await Notification.create({
      userId: output.createdBy,
      type: action === 'approve' ? 'OUTPUT_APPROVED' : 'OUTPUT_REJECTED',
      message: `Your output in project "${project.title}" was ${action === 'approve' ? 'approved' : 'rejected'}.`,
      link: `/outputs/${output._id}`
    });

    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ message: 'Error reviewing output' });
  }
};

export const getPendingReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Admins and Reviewers both must be EXPLICITLY ASSIGNED to see pending reviews
    if (!['Administrator', 'Reviewer'].includes(role || '')) {
      res.status(403).json({ message: 'Not authorized to view pending reviews' });
      return;
    }

    const projectFilter = { assignedReviewers: userId };

    const projects = await Project.find(projectFilter).select('_id');
    const projectIds = projects.map(p => p._id);

    const pendingOutputs = await GeneratedOutput.find({
      projectId: { $in: projectIds },
      status: 'PENDING_REVIEW'
    })
      .sort({ updatedAt: -1 })
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.status(200).json(pendingOutputs);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching pending reviews' });
  }
};

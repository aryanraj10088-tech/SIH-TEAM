import { Request, Response } from 'express';
import mongoose from 'mongoose';
import GeneratedOutput from '../models/GeneratedOutput';
import AuditLog from '../models/AuditLog';
import Project from '../models/Project';
import User from '../models/User';

const isReviewerOrAdmin = (role?: string) => ['Reviewer', 'Administrator'].includes(role || '');

// Helper to check project ownership for mutations like create/edit/delete
const checkProjectOwnership = async (projectId: string, userId: string | undefined) => {
  if (!userId) return { error: 'Not authenticated', status: 401 };
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };
  if (project.ownerId.toString() !== userId) return { error: 'Not authorized for this project', status: 403 };
  return { project, error: null };
};

// Helper for read access: reviewers/admins can view pending review tasks if assigned to project.
const checkProjectReadAccess = async (projectId: string, userId: string | undefined, userRole?: string) => {
  if (!userId) return { error: 'Not authenticated', status: 401 };
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };

  if (userRole === 'Administrator') return { project, error: null };
  if (userRole === 'Reviewer') {
    if (project.assignedReviewers?.some(id => id.toString() === userId)) return { project, error: null };
  }
  if (userRole === 'Viewer') {
    if (project.assignedViewers?.some(id => id.toString() === userId)) return { project, error: null };
  }
  if (project.ownerId.toString() === userId) return { project, error: null };

  return { error: 'Not authorized for this project', status: 403 };
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

    const { error, status } = await checkProjectReadAccess(projectId as string, req.user?._id?.toString(), req.user?.role);
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

    const { error, status } = await checkProjectReadAccess(output.projectId.toString(), req.user?._id?.toString(), req.user?.role);
    if (error) {
      res.status(status as number).json({ message: error });
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

    if (!req.user?._id) {
       res.status(401).json({ message: 'Not authenticated' });
       return;
    }

    // Save previous state to versions
    output.versions.push({
      content: output.content,
      editedBy: req.user._id,
      editedAt: new Date(),
      note: note || 'Manual edit'
    });

    output.content = content;
    // Keep it in DRAFT or revert to DRAFT if it was rejected/pending
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

    const { error, status } = await checkProjectOwnership(output.projectId.toString(), req.user?._id?.toString());
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

    // Reviewers/Admins with read access can add comments. Owners can add comments too.
    const { error, status } = await checkProjectReadAccess(output.projectId.toString(), req.user?._id?.toString(), req.user?.role);
    if (error) {
      res.status(status as number).json({ message: error });
      return;
    }

    if (!req.user?._id) {
       res.status(401).json({ message: 'Not authenticated' });
       return;
    }

    output.reviewerComments.push({
      userId: req.user._id,
      text,
      createdAt: new Date()
    });

    await output.save();

    await AuditLog.create({
      entityType: 'GeneratedOutput',
      entityId: output._id,
      action: 'COMMENT_ADDED',
      performedBy: req.user._id
    });

    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

export const reviewOutput = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, note } = req.body; // action: 'approve' | 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Invalid action' });
      return;
    }

    const output = await GeneratedOutput.findById(req.params.id);
    if (!output) {
      res.status(404).json({ message: 'Output not found' });
      return;
    }

    // Ensure Reviewer/Admin has read access to the project
    const { error: readError, status: readStatus } = await checkProjectReadAccess(output.projectId.toString(), req.user?._id?.toString(), req.user?.role);
    if (readError) {
      res.status(readStatus as number).json({ message: readError });
      return;
    }

    // Explicitly prevent self-review
    if (output.createdBy.toString() === req.user?._id?.toString()) {
      res.status(403).json({ message: 'Cannot review your own output' });
      return;
    }

    if (output.status !== 'PENDING_REVIEW') {
      res.status(400).json({ message: 'Only PENDING_REVIEW outputs can be approved/rejected' });
      return;
    }

    if (!req.user?._id) {
       res.status(401).json({ message: 'Not authenticated' });
       return;
    }

    output.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    output.reviewedBy = req.user._id;
    output.reviewedAt = new Date();
    output.approvalNote = note;

    await output.save();

    await AuditLog.create({
      entityType: 'GeneratedOutput',
      entityId: output._id,
      action: action === 'approve' ? 'APPROVED' : 'REJECTED',
      performedBy: req.user._id,
      metadata: { note }
    });

    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ message: 'Error reviewing output' });
  }
};

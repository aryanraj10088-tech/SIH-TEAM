import { Request, Response } from 'express';
import mongoose from 'mongoose';
import GeneratedOutput from '../models/GeneratedOutput';
import AuditLog from '../models/AuditLog';
import Project from '../models/Project';
import Notification from '../models/Notification';
import User from '../models/User';
import { sendWorkflowNotificationEmail } from '../services/email.service';
import { storageService } from '../services/storage/s3.storage';

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

    let hasReviewerAccess = false;
    if (req.user?.accountType === 'ORGANIZATION') {
      const outputCreator = await User.findById(output.createdBy);
      if (outputCreator && outputCreator.organizationId?.toString() === req.user.organizationId?.toString()) {
        hasReviewerAccess = true;
      }
    } else if (isAssignedReviewer) {
      hasReviewerAccess = true;
    }

    // The core privacy logic
    if (isOwner) {
       // Owner can always see their own output
    } else if (canReview && hasReviewerAccess && isPendingReview) {
       // Assigned reviewer/admin can only see it if it's explicitly submitted for review
    } else {
       res.status(403).json({ message: 'Not authorized to access this output' });
       return;
    }
    // For x_thread outputs, inline images as base64 data URLs so the browser renders them without any separate network request
    let outputObj: any = output.toObject();
    if (outputObj.format === 'x_thread' && Array.isArray(outputObj.content?.thread_tweets)) {
      const https = await import('https');
      
      const fetchAsBase64 = (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
          https.default.get(url, { rejectUnauthorized: false } as any, (s3Res: any) => {
            if (s3Res.statusCode !== 200) { resolve(null); return; }
            const chunks: Buffer[] = [];
            s3Res.on('data', (d: Buffer) => chunks.push(d));
            s3Res.on('end', () => {
              const b64 = Buffer.concat(chunks).toString('base64');
              const contentType = s3Res.headers['content-type'] || 'image/jpeg';
              resolve(`data:${contentType};base64,${b64}`);
            });
            s3Res.on('error', () => resolve(null));
          }).on('error', () => resolve(null));
        });
      };

      await Promise.all(outputObj.content.thread_tweets.map(async (tweet: any) => {
        if (tweet.image_storage_key) {
          try {
            const presignedUrl = await storageService.getFileUrl(tweet.image_storage_key);
            const dataUrl = await fetchAsBase64(presignedUrl);
            if (dataUrl) tweet.image_data_url = dataUrl;
          } catch (_) {}
        }
      }));
      
      res.status(200).json(outputObj);
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

    if (output.status === 'PENDING_REVIEW') {
      res.status(400).json({ message: 'Cannot edit an output while it is under review' });
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

    if (output.status !== 'DRAFT' && output.status !== 'REJECTED') {
      res.status(400).json({ message: 'Only DRAFT or REJECTED outputs can be submitted for review' });
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

    let reviewersToNotify: any[] = [];

    if (req.user?.accountType === 'ORGANIZATION' && req.user?.organizationId) {
      reviewersToNotify = await User.find({ 
        organizationId: req.user.organizationId,
        role: 'Reviewer',
        accountStatus: 'ACTIVE'
      });
    } else if (project && project.assignedReviewers && project.assignedReviewers.length > 0) {
      reviewersToNotify = await User.find({ _id: { $in: project.assignedReviewers } });
    }

    if (reviewersToNotify.length > 0) {
      const operatorName = req.user?.name || 'an operator';
      const notifications = reviewersToNotify.map(reviewer => ({
        userId: reviewer._id,
        type: 'OUTPUT_SUBMITTED',
        message: `New content submitted for review by ${operatorName}`,
        link: '/pending-reviews'
      }));
      await Notification.insertMany(notifications);

      for (const reviewer of reviewersToNotify) {
        // Safe check for decrypted email if applicable, though for emails we use plaintext or decrypt it
        // The reviewer.email returned from db is plaintext for system use if not using getter, wait, we hashed it!
        // So we need to decrypt it to send emails.
        let emailAddress = reviewer.email;
        if (reviewer.encryptedEmail) {
           const { decryptPII } = require('../utils/encryption');
           emailAddress = decryptPII(reviewer.encryptedEmail);
        }
        await sendWorkflowNotificationEmail(
          emailAddress,
          'Output Submitted for Review',
          'Review Required',
          `New content submitted for review by ${operatorName} in project "${project?.title || 'Unknown'}".`,
          '/pending-reviews'
        );
      }
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

    let hasReviewerAccess = false;
    if (req.user?.accountType === 'ORGANIZATION') {
      const outputCreator = await User.findById(output.createdBy);
      if (outputCreator && outputCreator.organizationId?.toString() === req.user.organizationId?.toString()) {
        hasReviewerAccess = true;
      }
    } else if (isAssignedReviewer) {
      hasReviewerAccess = true;
    }

    if (isOwner) {
       // Owner can comment
    } else if (canReview && hasReviewerAccess && isPendingReview) {
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
    
    let hasAccess = false;
    if (req.user?.accountType === 'ORGANIZATION') {
      const outputCreator = await User.findById(output.createdBy);
      if (outputCreator && outputCreator.organizationId?.toString() === req.user.organizationId?.toString()) {
        hasAccess = true;
      }
    } else if (isAssignedReviewer) {
      hasAccess = true;
    }

    if (!canReview || !hasAccess) {
      res.status(403).json({ message: 'You are not authorized to review this output' });
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

    const creator = await User.findById(output.createdBy);
    if (creator) {
      await sendWorkflowNotificationEmail(
        creator.email,
        `Output ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        `Output ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        `Your output in project "${project.title}" was ${action === 'approve' ? 'approved' : 'rejected'}.`,
        `/outputs/${output._id}`
      );
    }

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

    if (!['Administrator', 'Reviewer'].includes(role || '')) {
      res.status(403).json({ message: 'Not authorized to view pending reviews' });
      return;
    }

    let pendingOutputs = [];

    if (req.user?.accountType === 'ORGANIZATION' && req.user?.organizationId) {
      // Find users in the same org
      const orgUsers = await User.find({ organizationId: req.user.organizationId }).select('_id');
      const userIds = orgUsers.map(u => u._id);
      
      pendingOutputs = await GeneratedOutput.find({
        createdBy: { $in: userIds },
        status: 'PENDING_REVIEW'
      })
        .sort({ updatedAt: -1 })
        .populate('projectId', 'title')
        .populate('createdBy', 'name email');
    } else {
      // Fallback for personal accounts using legacy project.assignedReviewers
      const projects = await Project.find({ assignedReviewers: userId }).select('_id');
      const projectIds = projects.map(p => p._id);

      pendingOutputs = await GeneratedOutput.find({
        projectId: { $in: projectIds },
        status: 'PENDING_REVIEW'
      })
        .sort({ updatedAt: -1 })
        .populate('projectId', 'title')
        .populate('createdBy', 'name email');
    }

    res.status(200).json(pendingOutputs);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching pending reviews' });
  }
};


import https from 'https';

export const serveImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      res.status(400).json({ message: 'Missing image key' });
      return;
    }
    
    // Get pre-signed URL from S3
    const url = await storageService.getFileUrl(key);
    
    // Proxy the image using native https to bypass strict SSL MITM firewalls on this network
    https.get(url, { rejectUnauthorized: false }, (s3Res) => {
      if (s3Res.statusCode !== 200) {
        res.status(s3Res.statusCode || 500).json({ message: 'Failed to fetch image from S3' });
        return;
      }
      
      res.setHeader('Content-Type', s3Res.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      s3Res.pipe(res);
    }).on('error', (err) => {
      console.error('serveImage proxy error:', err);
      res.status(500).json({ message: 'Failed to stream image' });
    });
    
  } catch (err) {
    console.error('serveImage pre-proxy error:', err);
    res.status(500).json({ message: 'Failed to generate image URL' });
  }
};

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Source from '../models/Source';
import GeneratedOutput from '../models/GeneratedOutput';
import AuditLog from '../models/AuditLog';
import { storageService } from '../services/storage/s3.storage';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const isReviewerOrAdmin = (role?: string) => ['Reviewer', 'Administrator'].includes(role || '');

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    let filter = {};
    if (req.user?.role === 'Administrator') {
      filter = {};
    } else if (req.user?.role === 'Reviewer') {
      filter = { assignedReviewers: req.user._id };
    } else if (req.user?.role === 'Viewer') {
      filter = { assignedViewers: req.user._id };
    } else {
      filter = { ownerId: req.user?._id };
    }
    const projects = await Project.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const project = await Project.create({
      title,
      description,
      ownerId: req.user?._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const getProjectDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Reviewers and Viewers can access project details if they are explicitly assigned, Admins have global access.
    let canAccess = false;
    if (req.user?.role === 'Administrator') {
      canAccess = true;
    } else if (req.user?.role === 'Reviewer') {
      canAccess = project.assignedReviewers?.some(id => id.toString() === req.user?._id?.toString());
    } else if (req.user?.role === 'Viewer') {
      canAccess = project.assignedViewers?.some(id => id.toString() === req.user?._id?.toString());
    } else {
      canAccess = project.ownerId.toString() === req.user?._id?.toString();
    }
    
    if (!canAccess) {
      res.status(403).json({ message: 'Not authorized to access this project' });
      return;
    }

    // Also fetch sources
    const sources = await Source.find({ projectId: project._id }).sort({ createdAt: -1 });

    res.status(200).json({ project, sources });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project details' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  let session;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const isOwner = project.ownerId.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'Administrator';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to delete this project' });
      return;
    }

    const sources = await Source.find({ projectId: project._id });
    
    // We attempt a transaction for safe DB cleanup.
    // Note: If MongoDB is standalone (no replica set), transactions will throw an error.
    // We will catch that and fallback to non-transactional deletion.
    let useTransaction = true;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      useTransaction = false;
    }

    try {
      const options = useTransaction ? { session } : {};
      
      // Cascade delete DB records
      await Source.deleteMany({ projectId: project._id }, options);
      await GeneratedOutput.deleteMany({ projectId: project._id }, options);
      await Project.findByIdAndDelete(project._id, options);

      // Add audit log for accountability
      await AuditLog.create([{
        entityType: 'Project',
        entityId: project._id,
        action: 'PROJECT_DELETED',
        performedBy: req.user?._id,
        metadata: {
          projectTitle: project.title,
          sourcesDeleted: sources.length
        }
      }], options);

      if (useTransaction) {
        await session!.commitTransaction();
      }
    } catch (dbError) {
      if (useTransaction) {
        await session!.abortTransaction();
      }
      throw dbError;
    } finally {
      if (useTransaction) {
        session!.endSession();
      }
    }

    // Storage deletion happens AFTER successful DB commit to prevent data loss if DB fails.
    // Orphaned files in S3 are preferable to inconsistent DB state.
    for (const source of sources) {
      try {
        if (source.storageKey) {
          await storageService.deleteFile(source.storageKey);
        }
      } catch (err) {
        console.error(`Failed to delete file ${source.storageKey} from storage:`, err);
        // We log the error but don't fail the request since the DB is already clean.
      }
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Delete Project Error:', error);
    try {
      require('fs').writeFileSync('C:/Users/aryan/.gemini/antigravity-ide/brain/9bf56efc-2960-4fb5-85e6-59634dda89ab/scratch/delete_error.log', (error.stack || error.message || String(error)));
    } catch(e) {}
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

export const generateProjectContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sourceId, targetFormats, audience, tone, detailLevel, objective, language } = req.body as {
      sourceId?: string;
      targetFormats?: string[];
      audience?: string;
      tone?: string;
      detailLevel?: string;
      objective?: string;
      language?: string;
    };
    if (!mongoose.isValidObjectId(req.params.id) || (sourceId && !mongoose.isValidObjectId(sourceId))) {
      res.status(400).json({ message: 'Invalid project or source ID' });
      return;
    }
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    const isAdmin = req.user?.role === 'Administrator';
    const canGenerate = project.ownerId.toString() === req.user?._id.toString() || isAdmin;
    if (!canGenerate) {
      res.status(403).json({ message: 'Not authorized to generate content for this project' });
      return;
    }
    if (!sourceId || !Array.isArray(targetFormats) || targetFormats.length === 0) {
      res.status(400).json({ message: 'sourceId and targetFormats are required' });
      return;
    }

    const source = await Source.findOne({ _id: sourceId, projectId: project._id });
    if (!source) {
      res.status(404).json({ message: 'Source not found in this project' });
      return;
    }
    if (source.mimeType !== 'application/pdf') {
      res.status(400).json({ message: 'Phase 3 currently supports PDF sources only' });
      return;
    }

    const sourceUrl = await storageService.getFileUrl(source.storageKey);
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_url: sourceUrl,
        target_formats: targetFormats,
        audience,
        tone,
        detail_level: detailLevel,
        objective,
        language,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const payload = await aiResponse.json() as { detail?: string; results?: unknown; status?: string };
    if (!aiResponse.ok) {
      res.status(502).json({ message: payload.detail || 'AI service failed' });
      return;
    }

    res.status(200).json(payload);
  } catch (error) {
    console.error('Generation Error:', error);
    res.status(502).json({ message: 'AI service is unavailable' });
  }
};

export const assignProjectAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignedReviewers, assignedViewers } = req.body;
    
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Only Admins can assign users. Operators CANNOT.
    if (req.user?.role !== 'Administrator') {
      res.status(403).json({ message: 'Only Administrators can assign access' });
      return;
    }

    if (Array.isArray(assignedReviewers)) {
      project.assignedReviewers = assignedReviewers as mongoose.Types.ObjectId[];
    }
    if (Array.isArray(assignedViewers)) {
      project.assignedViewers = assignedViewers as mongoose.Types.ObjectId[];
    }

    await project.save();

    await AuditLog.create({
      entityType: 'Project',
      entityId: project._id,
      action: 'PROJECT_ACCESS_UPDATED',
      performedBy: req.user?._id,
      metadata: {
        reviewersAssigned: project.assignedReviewers.length,
        viewersAssigned: project.assignedViewers.length
      }
    });

    res.status(200).json(project);
  } catch (error) {
    console.error('Assign Project Access Error:', error);
    res.status(500).json({ message: 'Error assigning project access' });
  }
};

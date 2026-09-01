import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Source from '../models/Source';
import GeneratedOutput from '../models/GeneratedOutput';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';
import { storageService } from '../services/storage/s3.storage';
import { sendWorkflowNotificationEmail } from '../services/email.service';
import User from '../models/User';

const getAiServiceUrl = () => {
  const url = process.env.AI_SERVICE_URL;
  if (!url && process.env.NODE_ENV === 'production') {
    throw new Error('AI_SERVICE_URL environment variable is required in production');
  }
  return url ? url.replace(/\/$/, '') : 'http://localhost:8000';
};

const isReviewerOrAdmin = (role?: string) => ['Reviewer', 'Administrator'].includes(role || '');

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = { ownerId: req.user?._id };
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
    console.error('Error creating project:', error);
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

    // Only the owner of the project can access its details
    const canAccess = project.ownerId.toString() === req.user?._id?.toString();
    
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

    if (!isOwner) {
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
    const canGenerate = project.ownerId.toString() === req.user?._id.toString();
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


    const sourceUrl = await storageService.getFileUrl(source.storageKey);
    const aiResponse = await fetch(`${getAiServiceUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_url: sourceUrl,
        source_mime_type: source.mimeType,
        target_formats: targetFormats,
        audience,
        tone,
        detail_level: detailLevel,
        objective,
        language,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const responseText = await aiResponse.text();
    let payload: any;
    try {
      payload = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`AI Service returned an HTML page instead of JSON. You have likely pasted your Frontend or Node Backend URL into the AI_SERVICE_URL environment variable by mistake. It must be the URL of the Python AI Service.`);
    }

    if (!aiResponse.ok) {
      res.status(502).json({ message: payload.detail || 'AI service failed' });
      return;
    }

    // Persist to MongoDB
    if (payload.results) {
      for (const [format, data] of Object.entries(payload.results as Record<string, any>)) {
        const output = await GeneratedOutput.create({
          projectId: project._id,
          sourceId: source._id,
          createdBy: req.user?._id,
          format,
          content: data.content,
          status: 'DRAFT',
          versions: []
        });

        await AuditLog.create({
          entityType: 'GeneratedOutput',
          entityId: output._id,
          action: 'CREATED_VIA_GENERATION',
          performedBy: req.user?._id,
          metadata: { format, groundedness: data.audit?.groundedness_score }
        });

        // Attach DB ID back to the payload so frontend can route to it
        data._id = output._id;
      }
    }

    res.status(200).json(payload);
  } catch (error: any) {
    console.error('Generation Error:', error);
    res.status(502).json({ message: error.message || 'AI service is unavailable' });
  }
};

export const getAssignableProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'Administrator') {
      res.status(403).json({ message: 'Only Administrators can view assignable projects' });
      return;
    }
    
    // Return only metadata. No documents, no full outputs.
    const projects = await Project.find()
      .populate('ownerId', 'name email')
      .populate('assignedReviewers', 'name email')
      .select('_id title ownerId assignedReviewers createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignable projects' });
  }
};

export const addReviewer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewerId } = req.body;
    
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(reviewerId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    if (req.user?.role !== 'Administrator') {
      res.status(403).json({ message: 'Only Administrators can assign access' });
      return;
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const reviewer = await User.findById(reviewerId);
    if (!reviewer || reviewer.role !== 'Reviewer') {
      res.status(400).json({ message: 'User is not a Reviewer' });
      return;
    }

    if (project.ownerId.toString() === reviewerId) {
      res.status(400).json({ message: 'Cannot assign the project owner as a reviewer' });
      return;
    }

    if (!project.assignedReviewers.includes(reviewer._id as any)) {
      project.assignedReviewers.push(reviewer._id as any);
      await project.save();

      await AuditLog.create({
        entityType: 'Project',
        entityId: project._id,
        action: 'REVIEWER_ASSIGNED',
        performedBy: req.user?._id,
        metadata: { reviewerId }
      });

      await Notification.create({
        userId: reviewer._id,
        type: 'REVIEW_ASSIGNED',
        message: `You have been assigned a review for project: ${project.title}`,
        link: '/pending-reviews'
      });

      await sendWorkflowNotificationEmail(
        reviewer.email,
        'New Review Assignment',
        'New Project Assignment',
        `You have been assigned as a Reviewer for the project: "${project.title}".`,
        '/pending-reviews'
      );
    }

    res.status(200).json({ message: 'Reviewer assigned successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning reviewer' });
  }
};

export const removeReviewer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewerId } = req.params;
    
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(reviewerId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    if (req.user?.role !== 'Administrator') {
      res.status(403).json({ message: 'Only Administrators can assign access' });
      return;
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    project.assignedReviewers = project.assignedReviewers.filter(
      (id) => id.toString() !== reviewerId
    );
    await project.save();

    await AuditLog.create({
      entityType: 'Project',
      entityId: project._id,
      action: 'REVIEWER_REMOVED',
      performedBy: req.user?._id,
      metadata: { reviewerId }
    });

    res.status(200).json({ message: 'Reviewer removed successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error removing reviewer' });
  }
};

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Source from '../models/Source';
import { storageService } from '../services/storage/s3.storage';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const isReviewerOrAdmin = (role?: string) => ['Reviewer', 'Administrator'].includes(role || '');

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = isReviewerOrAdmin(req.user?.role) ? {} : { ownerId: req.user?._id };
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

    // Reviewers and administrators can access project details for review workflows.
    const canAccess = project.ownerId.toString() === req.user?._id.toString() || isReviewerOrAdmin(req.user?.role);
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
    if (project.ownerId.toString() !== req.user?._id.toString()) {
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

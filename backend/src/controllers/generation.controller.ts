import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Source from '../models/Source';
import GeneratedOutput from '../models/GeneratedOutput';
import AuditLog from '../models/AuditLog';
import { storageService } from '../services/storage/s3.storage';
import { generationService, GenerationConfig } from '../services/generation.service';

export const generateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, sourceId, targetFormats, config } = req.body as {
      projectId?: string;
      sourceId?: string;
      targetFormats?: string[];
      config?: GenerationConfig;
    };

    if (!projectId || !mongoose.isValidObjectId(projectId) || !sourceId || !mongoose.isValidObjectId(sourceId)) {
      res.status(400).json({ message: 'Invalid project or source ID' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.ownerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to generate content for this project' });
      return;
    }

    if (!Array.isArray(targetFormats) || targetFormats.length === 0) {
      res.status(400).json({ message: 'targetFormats is required' });
      return;
    }

    const source = await Source.findOne({ _id: sourceId, projectId: project._id });
    if (!source) {
      res.status(404).json({ message: 'Source not found in this project' });
      return;
    }
    if (source.mimeType !== 'application/pdf') {
      res.status(400).json({ message: 'Phase 4 currently supports PDF sources only' });
      return;
    }

    const sourceUrl = await storageService.getFileUrl(source.storageKey);
    
    // Call the generation service securely
    const payload = await generationService.generateContent(sourceUrl, targetFormats, config);
    
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

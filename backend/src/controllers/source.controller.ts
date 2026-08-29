import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Project from '../models/Project';
import Source from '../models/Source';
import { storageService } from '../services/storage/s3.storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const getSources = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Allow project owner and reviewers/admins to view sources
    const isOwner = project.ownerId.toString() === req.user?._id.toString();
    const isReviewerOrAdmin = ['Reviewer', 'Administrator'].includes(req.user?.role || '');
    
    if (!isOwner && !isReviewerOrAdmin) {
      res.status(403).json({ message: 'Not authorized to view sources for this project' });
      return;
    }

    const sources = await Source.find({ projectId }).sort({ createdAt: -1 });
    res.status(200).json(sources);
  } catch (error) {
    console.error('Get Sources Error:', error);
    res.status(500).json({ message: 'Error fetching sources' });
  }
};

export const uploadSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.ownerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to upload to this project' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const file = req.file;

    // Client/Multer reported MimeType validation
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      res.status(400).json({ message: 'Unsupported file type' });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({ message: 'File exceeds 10MB limit' });
      return;
    }

    // Magic Number validation for extra security (prevent EXE disguised as PDF)
    const fileTypeLib = await (eval('import("file-type")') as Promise<any>);
    const getFileType = fileTypeLib.fileTypeFromBuffer || fileTypeLib.fromBuffer || fileTypeLib.default?.fromBuffer || fileTypeLib.default?.fileTypeFromBuffer;
    const fileType = await getFileType(file.buffer);
    
    if (!fileType && file.mimetype !== 'text/plain') {
      res.status(400).json({ message: 'Invalid or unknown file signature' });
      return;
    }
    
    // Generate a secure random storage key
    const storageKey = `projects/${projectId}/sources/${uuidv4()}`;

    // Upload to S3 abstraction
    await storageService.uploadFile(file.buffer, storageKey, {
      mimeType: file.mimetype,
    });

    // Save metadata to MongoDB
    const source = await Source.create({
      projectId: project._id,
      originalName: file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'), // basic sanitization
      storageKey,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      status: 'PENDING',
      uploadedBy: req.user?._id,
    });

    res.status(201).json(source);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

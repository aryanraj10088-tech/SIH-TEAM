import { Request, Response } from 'express';
import Project from '../models/Project';
import Source from '../models/Source';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ ownerId: req.user?._id }).sort({ updatedAt: -1 });
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

    // IDOR protection: ensure the logged-in user owns this project
    if (project.ownerId.toString() !== req.user?._id.toString()) {
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

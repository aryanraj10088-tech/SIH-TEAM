import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  accountType: z.enum(['INDIVIDUAL', 'ORGANIZATION']).optional(),
  organizationName: z.string().max(100).optional()
}).refine(data => {
  if (data.accountType === 'ORGANIZATION') {
    return !!data.organizationName && data.organizationName.length >= 2;
  }
  return true;
}, {
  message: 'Organization name is required for organization accounts',
  path: ['organizationName']
});

export const createProjectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().max(1000).optional()
});

export const generateProjectSchema = z.object({
  sourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid source ID'),
  targetFormats: z.array(z.string()).min(1, 'Select at least one format').max(7),
  audience: z.string().max(100).optional(),
  tone: z.string().max(100).optional(),
  detailLevel: z.string().max(100).optional(),
  objective: z.string().max(100).optional(),
  language: z.string().max(100).optional()
});

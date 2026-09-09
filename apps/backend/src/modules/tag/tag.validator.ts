import { z } from 'zod';

export const createTagSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(50),
});

export const renameTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const attachTagSchema = z.object({
  tagId: z.string().min(1),
});

// note.validator.ts
import { z } from 'zod';

export const createNoteSchema = z.object({
  workspaceId: z.string(),
  notebookId: z.string().optional(),
  title: z.string().min(1),
  content: z.record(z.string(), z.any()).optional(),
});

export const updateNoteSchema = z.object({
  notebookId: z.string().nullable().optional(),
  title: z.string().min(1).optional(),
  content: z.record(z.string(), z.any()).optional(),
});

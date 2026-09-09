import { z } from 'zod';

export const copyNoteSchema = z.object({
  notebookId: z.string().nullable().optional(),
  title: z.string().trim().min(1).max(200).optional(),
});

export const copyNotebookSchema = z.object({
  parentId: z.string().nullable().optional(),
  title: z.string().trim().min(1).max(200).optional(),
});

export const exportQuerySchema = z.object({
  format: z.enum(['json', 'md']).default('json'),
});

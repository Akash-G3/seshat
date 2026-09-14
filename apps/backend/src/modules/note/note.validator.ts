import { z } from 'zod';

const blockNoteContentSchema = z.array(z.record(z.string(), z.any()));

export const createNoteSchema = z.object({
  workspaceId: z.string(),
  notebookId: z.string().optional(),
  title: z.string().min(1),
  content: blockNoteContentSchema.optional(),
});

export const updateNoteSchema = z.object({
  notebookId: z.string().nullable().optional(),
  title: z.string().min(1).optional(),
  content: blockNoteContentSchema.optional(),
});

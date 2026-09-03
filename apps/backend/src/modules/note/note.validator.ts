import { z } from 'zod';

// BlockNote's editor.document is an ARRAY of block objects, not a keyed
// object — validate the outer shape as an array. Each block's internal
// shape is deep, versioned by the BlockNote library, and not something
// we want to hand-maintain a schema for here, so keep elements loose.
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
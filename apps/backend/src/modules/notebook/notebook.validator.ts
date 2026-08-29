import { z } from 'zod';

export const createNotebookSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(1),
});
//rename function
export const renameNotebookSchema = z.object({
  title: z.string().min(1),
});

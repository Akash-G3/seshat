import { z } from 'zod';

export const createNotebookSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(1),
});

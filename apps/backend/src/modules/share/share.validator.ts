import { z } from 'zod';

export const createShareSchema = z.object({
  type: z.enum(['note', 'notebook']),
  id: z.string().min(1),
  expiresAt: z.coerce.date().optional(),
});

import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(200),
  workspaceId: z.string().optional(),
  type: z.enum(['all', 'note', 'notebook', 'tag']).default('all'),
  favouritesOnly: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

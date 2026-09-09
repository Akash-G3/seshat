import { z } from 'zod';

export const createFavouriteSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('note'), id: z.string().min(1) }),
  z.object({ type: z.literal('notebook'), id: z.string().min(1) }),
]);

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { RequestWithValidatedQuery } from '../../shared/middlewares/validateQuery';
import { searchService } from './search.service';
import { searchQuerySchema } from './search.validator';

type SearchQuery = z.infer<typeof searchQuerySchema>;
type SearchRequest = AuthenticatedRequest & RequestWithValidatedQuery<SearchQuery>;

export const searchController = {
  search: async (req: SearchRequest, res: Response, next: NextFunction) => {
    try {
      const { q, workspaceId, type, favouritesOnly, limit, offset } = req.validatedQuery;
      const results = await searchService.search(req.userId!, q, {
        workspaceId,
        type,
        favouritesOnly,
        limit,
        offset,
      });
      res.json({ success: true, data: results, meta: { limit, offset } });
    } catch (err) {
      next(err);
    }
  },
};

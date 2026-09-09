import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { favouriteService } from './favourite.service';

export const favouriteController = {
  add: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const favourite = await favouriteService.add(req.userId!, req.body);
      res.status(201).json({ success: true, data: favourite });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = typeof req.query.workspaceId === 'string' ? req.query.workspaceId : undefined;
      const favourites = await favouriteService.list(req.userId!, workspaceId);
      res.json({ success: true, data: favourites });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await favouriteService.remove(req.userId!, req.body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

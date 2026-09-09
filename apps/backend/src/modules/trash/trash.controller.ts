import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { trashService } from './trash.service';

export const trashController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = typeof req.query.workspaceId === 'string' ? req.query.workspaceId : undefined;
      const items = await trashService.list(req.userId!, workspaceId);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },
  moveToTrash: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await trashService.moveToTrash(req.userId!, req.body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
  restore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await trashService.restore(req.userId!, req.body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
  remove: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await trashService.deletePermanently(req.userId!, req.body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
  empty: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await trashService.empty(req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

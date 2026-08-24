import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { workspaceService } from './workspace.service';

export const workspaceController = {
  getMine: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await workspaceService.findByOwner(req.userId!);
      res.json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  },

  rename: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await workspaceService.rename(req.userId!, req.body.name);
      res.json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  },
};

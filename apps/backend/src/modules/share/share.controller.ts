import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { shareService } from './share.service';

export const shareController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const share = await shareService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: share });
    } catch (err) {
      next(err);
    }
  },
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const shares = await shareService.list(req.userId!);
      res.json({ success: true, data: shares });
    } catch (err) {
      next(err);
    }
  },
  revoke: async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await shareService.revoke(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
  publicView: async (req: Request<{ token: string }>, res: Response, next: NextFunction) => {
    try {
      const item = await shareService.resolvePublic(req.params.token);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },
};

import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { tagService } from './tag.service';

export const tagController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tag = await tagService.create(req.userId!, req.body.workspaceId, req.body.name);
      res.status(201).json({ success: true, data: tag });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = typeof req.query.workspaceId === 'string' ? req.query.workspaceId : undefined;
      const tags = await tagService.list(req.userId!, workspaceId);
      res.json({ success: true, data: tags });
    } catch (err) {
      next(err);
    }
  },

  rename: async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const tag = await tagService.rename(req.params.id, req.userId!, req.body.name);
      res.json({ success: true, data: tag });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await tagService.remove(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  attach: async (req: AuthenticatedRequest<{ noteId: string }>, res: Response, next: NextFunction) => {
    try {
      const relation = await tagService.attachToNote(req.params.noteId, req.body.tagId, req.userId!);
      res.status(201).json({ success: true, data: relation.tag });
    } catch (err) {
      next(err);
    }
  },

  detach: async (
    req: AuthenticatedRequest<{ noteId: string; tagId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await tagService.detachFromNote(req.params.noteId, req.params.tagId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  listForNote: async (
    req: AuthenticatedRequest<{ noteId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rows = await tagService.listForNote(req.params.noteId, req.userId!);
      res.json({ success: true, data: rows.map((row) => row.tag) });
    } catch (err) {
      next(err);
    }
  },
};

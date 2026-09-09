import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { exportService } from './export.service';

const safeFilename = (title: string) =>
  title
    .replace(/[^a-z0-9-_ ]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'note';

export const exportController = {
  copyNote: async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const note = await exportService.copyNote(req.params.id, req.userId!, req.body);
      res.status(201).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  },

  copyNotebook: async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const notebook = await exportService.copyNotebook(req.params.id, req.userId!, req.body);
      res.status(201).json({ success: true, data: notebook });
    } catch (err) {
      next(err);
    }
  },

  exportNote: async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const format = req.query.format === 'md' ? 'md' : 'json';
      const exported = await exportService.exportNote(req.params.id, req.userId!);
      const title = exported.json.note.title;

      if (format === 'md') {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename(title)}.md"`);
        res.send(exported.markdown);
        return;
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename(title)}.json"`);
      res.send(JSON.stringify(exported.json, null, 2));
    } catch (err) {
      next(err);
    }
  },
};

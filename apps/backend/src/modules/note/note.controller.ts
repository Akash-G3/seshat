// note.controller.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { noteService } from "./note.service";

export const noteController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const note = await noteService.create({
        workspaceId: req.body.workspaceId,
        notebookId: req.body.notebookId,
        ownerId: req.userId!,
        title: req.body.title,
        content: req.body.content,
      });
      res.status(201).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  },

  listMine: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const notes = await noteService.findAllByOwner(req.userId!);
      res.json({ success: true, data: notes });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const note = await noteService.findById(req.params.id, req.userId!);
      if (!note) {
        res.status(404).json({ success: false, message: "Note not found" });
        return;
      }
      res.json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const note = await noteService.update(req.params.id, req.userId!, {
        title: req.body.title,
        content: req.body.content,
        notebookId: req.body.notebookId,
      });
      if (!note) {
        res.status(404).json({ success: false, message: "Note not found" });
        return;
      }
      res.json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await noteService.remove(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
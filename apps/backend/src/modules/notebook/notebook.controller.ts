// import { Response, NextFunction } from 'express';
// import { AuthenticatedRequest } from '../auth/auth.middleware';
// import { notebookService } from './notebook.service';

// export const notebookController = {
//   create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     try {
//       const notebook = await notebookService.create(
//         req.userId!,
//         req.body.workspaceId,
//         req.body.title
//       );
//       res.status(201).json({ success: true, data: notebook });
//     } catch (err) {
//       next(err);
//     }
//   },

//   listByWorkspace: async (
//     req: AuthenticatedRequest<{ workspaceId: string }>,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const notebooks = await notebookService.findAllByWorkspace(
//         req.userId!,
//         req.params.workspaceId
//       );
//       res.json({ success: true, data: notebooks });
//     } catch (err) {
//       next(err);
//     }
//   },

// remove: async (
//   req: AuthenticatedRequest<{ id: string }>,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const deleted = await notebookService.remove(req.params.id, req.userId!);
//     if (!deleted) {
//       res.status(404).json({ success: false, message: "Notebook not found" });
//       return;
//     }
//     res.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// },
//   //for rename functions
//   update: async (
//     req: AuthenticatedRequest<{ id: string }>,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const notebook = await notebookService.rename(req.params.id, req.userId!, req.body.title);

//       if (!notebook) {
//         res.status(404).json({ success: false, message: 'Notebook not found' });
//         return;
//       }

//       res.json({ success: true, data: notebook });
//     } catch (err) {
//       next(err);
//     }
//   },
// };


import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { notebookService, DuplicateNotebookTitleError } from './notebook.service';

export const notebookController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const notebook = await notebookService.create(
        req.userId!,
        req.body.workspaceId,
        req.body.title,
        req.body.parentId ?? null
      );
      res.status(201).json({ success: true, data: notebook });
    } catch (err) {
      if (err instanceof DuplicateNotebookTitleError) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  listByWorkspace: async (
    req: AuthenticatedRequest<{ workspaceId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // ?tree=true returns a nested parent -> children structure instead of a flat list.
      const notebooks =
        req.query.tree === 'true'
          ? await notebookService.findTreeByWorkspace(req.userId!, req.params.workspaceId)
          : await notebookService.findAllByWorkspace(req.userId!, req.params.workspaceId);

      res.json({ success: true, data: notebooks });
    } catch (err) {
      next(err);
    }
  },

  remove: async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deleted = await notebookService.remove(req.params.id, req.userId!);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Notebook not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  //for rename functions
  update: async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const notebook = await notebookService.rename(req.params.id, req.userId!, req.body.title);

      if (!notebook) {
        res.status(404).json({ success: false, message: 'Notebook not found' });
        return;
      }

      res.json({ success: true, data: notebook });
    } catch (err) {
      if (err instanceof DuplicateNotebookTitleError) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  // Move a notebook to a new parent (or to the workspace root when parentId is null).
  move: async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const notebook = await notebookService.move(
        req.params.id,
        req.userId!,
        req.body.parentId ?? null
      );

      if (!notebook) {
        res.status(404).json({ success: false, message: 'Notebook not found' });
        return;
      }

      res.json({ success: true, data: notebook });
    } catch (err) {
      if (err instanceof DuplicateNotebookTitleError) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },
};
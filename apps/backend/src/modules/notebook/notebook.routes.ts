// import { Router } from 'express';
// import { notebookController } from './notebook.controller';
// import { requireAuth } from '../auth/auth.middleware';
// import { validate } from '../../shared/middlewares/validate';
// import { createNotebookSchema } from './notebook.validator';
// import { renameNotebookSchema } from './notebook.validator';

// const router = Router();

// router.use(requireAuth);
// router.post('/', validate(createNotebookSchema), notebookController.create);
// router.get('/workspace/:workspaceId', notebookController.listByWorkspace);
// router.delete('/:id', notebookController.remove);
// router.patch('/:id', validate(renameNotebookSchema), notebookController.update);

// export default router;


import { Router } from 'express';
import { notebookController } from './notebook.controller';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../shared/middlewares/validate';
import {
  createNotebookSchema,
  renameNotebookSchema,
  moveNotebookSchema,
} from './notebook.validator';

const router = Router();

router.use(requireAuth);
router.post('/', validate(createNotebookSchema), notebookController.create);
// GET /workspace/:workspaceId          -> flat list
// GET /workspace/:workspaceId?tree=true -> nested parent/children tree
router.get('/workspace/:workspaceId', notebookController.listByWorkspace);
router.delete('/:id', notebookController.remove);
router.patch('/:id', validate(renameNotebookSchema), notebookController.update);
router.patch('/:id/move', validate(moveNotebookSchema), notebookController.move);

export default router;
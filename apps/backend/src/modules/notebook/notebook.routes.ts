import { Router } from 'express';
import { notebookController } from './notebook.controller';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../shared/middlewares/validate';
import { createNotebookSchema } from './notebook.validator';
import { renameNotebookSchema } from './notebook.validator';

const router = Router();

router.use(requireAuth);
router.post('/', validate(createNotebookSchema), notebookController.create);
router.get('/workspace/:workspaceId', notebookController.listByWorkspace);
router.delete('/:id', notebookController.remove);
router.patch('/:id', validate(renameNotebookSchema), notebookController.update);

export default router;

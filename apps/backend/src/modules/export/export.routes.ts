import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../shared/middlewares/validate';
import { exportController } from './export.controller';
import { copyNoteSchema, copyNotebookSchema } from './export.validator';

const router = Router();
router.use(requireAuth);

router.post('/notes/:id/copy', validate(copyNoteSchema), exportController.copyNote);
router.get('/notes/:id/export', exportController.exportNote);
router.post('/notebooks/:id/copy', validate(copyNotebookSchema), exportController.copyNotebook);

export default router;

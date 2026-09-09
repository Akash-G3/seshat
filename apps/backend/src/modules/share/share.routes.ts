import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../shared/middlewares/validate';
import { shareController } from './share.controller';
import { createShareSchema } from './share.validator';

const router = Router();
router.get('/public/:token', shareController.publicView);
router.use(requireAuth);
router.get('/', shareController.list);
router.post('/', validate(createShareSchema), shareController.create);
router.delete('/:id', shareController.revoke);

export default router;

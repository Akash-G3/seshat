import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../shared/middlewares/validate';
import { trashController } from './trash.controller';
import { trashTargetSchema } from './trash.validator';

const router = Router();
router.use(requireAuth);

router.get('/', trashController.list);
router.post('/', validate(trashTargetSchema), trashController.moveToTrash);
router.post('/restore', validate(trashTargetSchema), trashController.restore);
router.delete('/item', validate(trashTargetSchema), trashController.remove);
router.delete('/', trashController.empty);

export default router;

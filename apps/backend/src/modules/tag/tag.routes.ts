import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../shared/middlewares/validate';
import { tagController } from './tag.controller';
import { attachTagSchema, createTagSchema, renameTagSchema } from './tag.validator';

const router = Router();
router.use(requireAuth);

router.get('/', tagController.list);
router.post('/', validate(createTagSchema), tagController.create);
router.patch('/:id', validate(renameTagSchema), tagController.rename);
router.delete('/:id', tagController.remove);
router.get('/note/:noteId', tagController.listForNote);
router.post('/note/:noteId', validate(attachTagSchema), tagController.attach);
router.delete('/note/:noteId/:tagId', tagController.detach);

export default router;

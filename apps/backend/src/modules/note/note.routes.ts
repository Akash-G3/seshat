import { Router } from 'express';
import { noteController } from './note.controller';
import { requireAuth } from '../auth/auth.middleware'; // adjust relative path to your actual location // your existing JWT middleware
import { validate } from '../../shared/middlewares/validate';
import { createNoteSchema, updateNoteSchema } from './note.validator';

const router = Router();

router.use(requireAuth); // every note route requires a logged-in user

router.post('/', validate(createNoteSchema), noteController.create);
router.get('/', noteController.listMine);
router.get('/:id', noteController.getById);
router.patch('/:id', validate(updateNoteSchema), noteController.update);
router.delete('/:id', noteController.remove);

export default router;

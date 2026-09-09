import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { validate } from '../../shared/middlewares/validate';
import { favouriteController } from './favourite.controller';
import { createFavouriteSchema } from './favourite.validator';

const router = Router();
router.use(requireAuth);

router.get('/', favouriteController.list);
router.post('/', validate(createFavouriteSchema), favouriteController.add);
router.delete('/', validate(createFavouriteSchema), favouriteController.remove);

export default router;

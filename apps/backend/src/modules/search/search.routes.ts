import { Router } from 'express';
import { searchController } from './search.controller';
import { requireAuth } from '../auth/auth.middleware';
import { validateQuery } from '../../shared/middlewares/validateQuery';
import { searchQuerySchema } from './search.validator';

const router = Router();

router.use(requireAuth);
router.get('/', validateQuery(searchQuerySchema), searchController.search);

export default router;
import { Router } from 'express';
import apiController from '../controllers/apiController';

const router = Router();
//self route for testing
router.route("/self").get(apiController.self)

export default router
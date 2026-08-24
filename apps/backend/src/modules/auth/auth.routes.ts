// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  verifyEmailHandler,
  forgotPassword,
  resetPasswordHandler,
} from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/verify-email', verifyEmailHandler);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordHandler);

export default router;

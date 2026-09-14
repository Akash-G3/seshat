import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  verifyEmailHandler,
  resendVerificationEmailHandler,
  forgotPassword,
  resetPasswordHandler,
} from './auth.controller';
import { asyncHandler } from '../../shared/utils/asyncHandler';
const router = Router();
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.get('/verify-email', asyncHandler(verifyEmailHandler));
router.post('/resend-verification', asyncHandler(resendVerificationEmailHandler));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPasswordHandler));

export default router;

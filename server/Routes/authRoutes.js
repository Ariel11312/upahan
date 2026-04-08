import { Router } from 'express';
import {
  createUser,
  getUserById,
  loginUser,
  loginIpLimiter,
  otpIpLimiter,
  otpPhoneLimiter,
  otpVerifyLimiter,
  sendOTP,
  signupLimiter,
  verifyOTP,
} from '../Auth/userAuth.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = Router();

router.get('/me',          authMiddleware,                              getUserById);
router.post('/send-otp',   otpIpLimiter, otpPhoneLimiter,              sendOTP);
router.post('/verify-otp', otpVerifyLimiter,                           verifyOTP);
router.post('/signup',     signupLimiter,                              createUser);
router.post('/login',      loginIpLimiter,                             loginUser);

export default router;
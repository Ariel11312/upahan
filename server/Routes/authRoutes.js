import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit'; // Import the helper function
import { sendOTP, verifyOTP } from '../Auth/userAuth.js';

const router = Router();

// Fixed OTP IP limiter with proper IPv6 handling
const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => ipKeyGenerator(req.ip), // Fixed: use ipKeyGenerator
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests from your device.' },
});

// Fixed OTP phone limiter with proper IPv6 handling
const otpPhoneLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => {
    const phone = req.body?.phone;
    if (phone) return `phone:${phone}`;
    return ipKeyGenerator(req.ip); // Fixed: use ipKeyGenerator for fallback
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests for this number. Wait 10 minutes.' },
});

// Fixed OTP verify limiter with proper IPv6 handling
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => ipKeyGenerator(req.ip), // Fixed: use ipKeyGenerator
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification attempts. Wait 10 minutes.' },
});

router.post('/send-otp', otpIpLimiter, otpPhoneLimiter, sendOTP);
router.post('/verify-otp', otpVerifyLimiter, verifyOTP);

export default router;
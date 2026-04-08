import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { sendOTP, verifyOTP } from '../Auth/userAuth.js'

const router = Router()

const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
  message: { message: 'Too many OTP requests from your device.' },
})

const otpPhoneLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body?.phone ?? req.ip,
  message: { message: 'Too many OTP requests for this number. Wait 10 minutes.' },
})

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip,
  message: { message: 'Too many verification attempts. Wait 10 minutes.' },
})

router.post('/send-otp',   otpIpLimiter, otpPhoneLimiter, sendOTP)
router.post('/verify-otp', otpVerifyLimiter,              verifyOTP)

export default router
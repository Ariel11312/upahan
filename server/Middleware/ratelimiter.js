// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// ── Generic IP-based limiter (apply to all routes) ──────────────────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,                  // 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// ── OTP send — very strict: 3 sends per phone per 10 min ────────────────────
export const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body?.phone ?? req.ip, // per phone number
  message: { message: 'Too many OTP requests for this number. Wait 10 minutes.' },
});

// ── OTP send — also limit per IP independently ──────────────────────────────
export const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,   // 5 different numbers per IP per 10 min
  keyGenerator: (req) => req.ip,
  message: { message: 'Too many OTP requests from your device.' },
});

// ── Signup — 5 attempts per IP per hour ─────────────────────────────────────
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
  message: { message: 'Too many sign-up attempts. Try again in an hour.' },
});

// ── Login — 20 attempts per IP per 15 min ───────────────────────────────────
export const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip,
  message: { message: 'Too many login attempts from your device.' },
});
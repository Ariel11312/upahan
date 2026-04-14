import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit'; // Import the helper
import { createUser, getUserById, loginUser } from '../Controllers/userController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = Router();

// Fixed signup limiter with proper IPv6 handling
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => ipKeyGenerator(req.ip), // Fixed: use ipKeyGenerator
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-up attempts. Please try again in an hour.' },
});

// Fixed login limiter with proper IPv6 handling
const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  keyGenerator: (req) => ipKeyGenerator(req.ip), // Fixed: use ipKeyGenerator
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from your device.' },
});

// Routes
router.get('/', authMiddleware, getUserById);
router.post('/signup', signupLimiter, createUser);
router.post('/login', loginIpLimiter, loginUser);

export default router;
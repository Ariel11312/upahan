import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { createUser, getUserById, loginUser } from '../Controllers/userController.js'
import authMiddleware from '../Middleware/authMiddleware.js'

const router = Router()

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
  message: { message: 'Too many sign-up attempts. Please try again in an hour.' },
})

const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip,
  message: { message: 'Too many login attempts from your device.' },
})

router.get('/',        authMiddleware,  getUserById)
router.post('/signup', signupLimiter,   createUser)
router.post('/login',  loginIpLimiter,  loginUser)

export default router
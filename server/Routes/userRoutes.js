import { Router } from 'express'
import { createUser, getUserById, loginUser } from '../Controllers/userController.js'
import authMiddleware from '../Middleware/authMiddleware.js'
import {
  loginIpLimiter,
  signupLimiter,
} from '../Auth/userAuth.js'

const router = Router()

router.get('/',        authMiddleware,  getUserById)
router.post('/signup', signupLimiter,   createUser)
router.post('/login',  loginIpLimiter,  loginUser)

export default router
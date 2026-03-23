import { Router } from 'express'
import { createUser, getUserById, loginUser } from '../Controllers/userController.js'
import authMiddleware from '../Middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, getUserById)
router.post('/signup', createUser)
router.post('/login', loginUser)

export default router
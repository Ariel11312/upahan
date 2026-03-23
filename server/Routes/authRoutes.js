import { Router } from 'express'
import { authCallback, googleLogin, saveUser, sendOTP, verifyOTP } from "../Auth/userAuth.js"

const router = Router()

router.get('/google', googleLogin)
router.get('/callback', authCallback)
router.post('/save-user', saveUser) 
router.post('/send-otp', sendOTP) 
router.post('/verify-otp', verifyOTP) 


export default router
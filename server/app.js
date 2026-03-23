import 'dotenv/config'
import express from 'express'
import userRoutes from './Routes/userRoutes.js'
import authRoutes from './Routes/authRoutes.js'
const app = express()
import cookieParser from 'cookie-parser'



app.use(express.json())
app.use(cookieParser())
app.use("/api/users", userRoutes )
app.use("/api/auth", authRoutes )

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
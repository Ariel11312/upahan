import 'dotenv/config'
import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import userRoutes from './Routes/userRoutes.js'
import authRoutes from './Routes/authRoutes.js'

const app = express()

// ─── Security Headers ─────────────────────────────────────────────────────────
// Sets X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, etc.
app.use(helmet())

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Only allow requests from your actual frontend — blocks random origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  exposedHeaders: ['X-New-Access-Token', 'X-New-Refresh-Token'],
  credentials: true,
}))

// ─── Body Limits ──────────────────────────────────────────────────────────────
// Prevents 100MB body attacks from blocking the event loop
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
// Required on Render/Heroku so req.ip returns the real client IP,
// not the load balancer IP (which would make all rate limits share one bucket)
app.set('trust proxy', 1)

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
// Catch-all: 100 requests per IP per 15 minutes across all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
})
app.use(globalLimiter)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes)
app.use('/api/auth',  authRoutes)

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any unhandled errors so stack traces never leak to the client
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err)
  res.status(500).json({ message: 'An unexpected error occurred.' })
})

// ─── Server with Request Timeout ─────────────────────────────────────────────
// Kills slow-loris connections that hold sockets open indefinitely
const PORT   = process.env.PORT || 3000
const server = http.createServer(app)
server.setTimeout(10000) // 10 seconds max per request

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
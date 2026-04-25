import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

// Import your route files
import userRoutes from './Routes/userRoutes.js';
import authRoutes from './Routes/authRoutes.js';

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables. Please check your .env file');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.error('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Supabase Setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8081',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  exposedHeaders: ['X-New-Access-Token', 'X-New-Refresh-Token'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.set('trust proxy', 1);

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});
app.use(globalLimiter);

// Routes
app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Socket Logic
// ─────────────────────────────────────────────────────────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  // ── Register ──────────────────────────────────────────────────────────────
  socket.on('register', (userId) => {
    if (!userId) return;
    socket.userId = userId;
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  // ── Send message ──────────────────────────────────────────────────────────
  // FIX 1: added tempId so client can confirm its optimistic bubble
  // FIX 2: added photo_urls so uploaded photos are persisted to the DB
  socket.on('send_message', async ({ senderId, receiverId, content, tempId, photo_urls, propertyId}) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id:   senderId,
          receiver_id: receiverId,
          content:     content || 'EMPTY',
          photo_urls:  Array.isArray(photo_urls) && photo_urls.length > 0
                         ? photo_urls
                         : null,
          property_id:propertyId
        })
        .select()
        .single();

      if (error) {
        console.error('[send_message] DB insert error:', error.message);
        socket.emit('message_error', { tempId, reason: error.message });
        return;
      }

      // Emit to receiver's room AND back to sender so the optimistic
      // bubble gets replaced with the confirmed DB record
      io.to(receiverId).emit('receive_message', { ...data, tempId });
      io.to(senderId).emit('receive_message', { ...data, tempId });

    } catch (err) {
      console.error('[send_message] exception:', err.message);
      socket.emit('message_error', { tempId, reason: err.message });
    }
  });

  // ── Mark read ─────────────────────────────────────────────────────────────
  socket.on('mark_read', async ({ senderId, receiverId }) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .eq('read', false);

      io.to(senderId).emit('messages_read', { by: receiverId });
    } catch (err) {
      console.error('[mark_read] error:', err.message);
    }
  });

  // ── Typing indicators ─────────────────────────────────────────────────────
  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('typing', { senderId });
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('stop_typing', { senderId });
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`[disconnect] userId=${socket.userId}`);
    }
  });
}); // ← end of io.on('connection')

// ─────────────────────────────────────────────────────────────────────────────
// Error Handlers
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────
server.setTimeout(10000);
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 Supabase connected to: ${process.env.SUPABASE_URL}`);
});
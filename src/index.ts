import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initIO } from './services/socket.service';
import authRoutes from './routes/auth.routes';
import boardRoutes from './routes/board.routes';
import listRoutes from './routes/list.routes';
import cardRoutes from './routes/card.routes';
import commentRoutes from './routes/comment.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

initIO(io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client joins a board room to receive real-time events for that board
  socket.on('join:board', (boardId: string) => {
    socket.join(`board:${boardId}`);
    console.log(`📋 Socket ${socket.id} joined board:${boardId}`);
  });

  // Client leaves a board room (navigate away)
  socket.on('leave:board', (boardId: string) => {
    socket.leave(`board:${boardId}`);
    console.log(`🚪 Socket ${socket.id} left board:${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ─── Express Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', listRoutes);
app.use('/api', cardRoutes);
app.use('/api', commentRoutes);

// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🔴 Socket.io ready for real-time connections`);
  console.log(`📡 Frontend can connect from ${FRONTEND_URL}`);
});
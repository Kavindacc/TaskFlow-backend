import { Server } from 'socket.io';

let io: Server;

export const initIO = (server: Server) => {
  io = server;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Helper to emit a board event to all sockets in a board room
export const emitBoardEvent = (boardId: string, event: string, data: unknown) => {
  if (!io) return;
  io.to(`board:${boardId}`).emit(event, data);
};

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../middleware/auth.middleware';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as AuthPayload;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as AuthPayload;
    console.log(`User ${user.userId} connected to socket`);

    // Join tenant room automatically
    socket.join(`tenant:${user.tenantId}`);
    socket.join(`user:${user.userId}`);

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${user.userId} disconnected`);
    });
  });
};

export const emitToTenant = (tenantId: string, event: string, data: any) => {
  if (io) io.to(`tenant:${tenantId}`).emit(event, data);
};

export const emitToConversation = (conversationId: string, event: string, data: any) => {
  if (io) io.to(`conversation:${conversationId}`).emit(event, data);
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

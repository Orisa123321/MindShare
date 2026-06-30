import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // For development
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Allow clients to join specific question rooms
    socket.on('join_question', (questionId: string) => {
      socket.join(`question_${questionId}`);
      console.log(`Socket ${socket.id} joined room: question_${questionId}`);
    });

    socket.on('leave_question', (questionId: string) => {
      socket.leave(`question_${questionId}`);
      console.log(`Socket ${socket.id} left room: question_${questionId}`);
    });

    // Group Chat Rooms
    socket.on('join_group', (groupId: string) => {
      socket.join(`group_${groupId}`);
      console.log(`Socket ${socket.id} joined group room: group_${groupId}`);
    });

    socket.on('leave_group', (groupId: string) => {
      socket.leave(`group_${groupId}`);
      console.log(`Socket ${socket.id} left group room: group_${groupId}`);
    });

    socket.on('send_message', async (data: { groupId: string; userId: string; content: string }) => {
      try {
        const { saveMessage } = await import('../services/chat.service.js');
        const saved = await saveMessage(data.groupId, data.userId, data.content);
        io.to(`group_${data.groupId}`).emit('new_message', saved);
      } catch (error) {
        console.error('Failed to save/broadcast group chat message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

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

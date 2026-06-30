import dotenv from 'dotenv';

// Load environment variables BEFORE importing app
dotenv.config();

import app from './app.js';
import prisma from './config/database.js';

// ============================================================================
// Server Entry Point
// ============================================================================

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap(): Promise<void> {
  try {
    // -----------------------------------------------------------------------
    // 1. Verify database connection
    // -----------------------------------------------------------------------
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // -----------------------------------------------------------------------
    // 2. Start HTTP server & Socket.io
    // -----------------------------------------------------------------------
    const { createServer } = await import('http');
    const { initSocket } = await import('./config/socket.config.js');

    const server = createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🧠 MindShare API Server                    ║
  ║                                              ║
  ║   → Local:   http://localhost:${PORT}          ║
  ║   → Health:  http://localhost:${PORT}/api/v1/health
  ║   → Env:     ${process.env.NODE_ENV || 'development'}                    ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------

async function shutdown(signal: string): Promise<void> {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  await prisma.$disconnect();
  console.log('👋 Database disconnected. Goodbye!');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Catch unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
bootstrap();

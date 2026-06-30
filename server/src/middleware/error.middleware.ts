import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

// ============================================================================
// Global Error Handling Middleware
// ============================================================================
// Catches all errors thrown by route handlers and middleware.
// Converts them to a consistent JSON response format.
// ============================================================================

/**
 * Global error handler — must be registered LAST with app.use().
 * Handles both operational errors (AppError) and unexpected errors.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error('❌ Error:', err.message);
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle Prisma-specific errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    switch (prismaError.code) {
      case 'P2002':
        // Unique constraint violation
        const field = prismaError.meta?.target?.[0] || 'field';
        res.status(409).json({
          success: false,
          error: `A record with this ${field} already exists`,
        });
        return;

      case 'P2025':
        // Record not found
        res.status(404).json({
          success: false,
          error: 'Record not found',
        });
        return;

      default:
        break;
    }
  }

  // Handle JSON parsing errors
  if (err.name === 'SyntaxError' && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
    });
    return;
  }

  // Handle Multer file upload errors
  if (err.name === 'MulterError') {
    const multerError = err as any;

    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(413).json({
          success: false,
          error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 200}MB`,
        });
        return;

      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          success: false,
          error: 'Unexpected file field',
        });
        return;

      default:
        break;
    }
  }

  // Fallback: unexpected/unknown error
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
  });
}

/**
 * 404 handler for unmatched routes.
 * Must be registered after all route handlers.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

export default errorHandler;

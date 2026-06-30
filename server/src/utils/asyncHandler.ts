import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Async Handler Wrapper
// ============================================================================
// Wraps async route handlers to catch rejected promises and forward
// them to Express's error handling middleware.
// Without this, unhandled async errors would crash the server.
// ============================================================================

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps an async Express route handler to automatically catch errors.
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.findAll();
 *   res.json({ success: true, data: users });
 * }));
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;

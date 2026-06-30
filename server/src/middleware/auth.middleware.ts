import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthPayload, UnauthorizedError } from '../types/index.js';

// ============================================================================
// JWT Authentication Middleware
// ============================================================================
// Extracts and verifies the JWT from the Authorization header.
// Attaches the decoded user payload to `req.user`.
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use';

/**
 * Middleware that requires a valid JWT token.
 * Returns 401 if token is missing or invalid.
 */
export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication middleware.
 * Attaches user info if a valid token is present, but doesn't block the request.
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = decoded;
      }
    }

    next();
  } catch {
    // Token is invalid but we don't block — just continue without user
    next();
  }
}

export default authenticate;

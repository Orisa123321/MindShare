import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';

// ============================================================================
// Auth Controller — HTTP Handlers for Authentication
// ============================================================================

/**
 * POST /auth/register
 * Register a new user account.
 */
export const register = asyncHandler(async (req, res: Response) => {
  const { username, email, password } = req.body;

  const result = await authService.register({ username, email, password });

  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'User registered successfully',
    data: result,
  };

  res.status(201).json(response);
});

/**
 * POST /auth/login
 * Log in with email and password.
 */
export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Login successful',
    data: result,
  };

  res.status(200).json(response);
});

/**
 * GET /auth/me
 * Get the currently authenticated user's profile.
 */
export const getMe = asyncHandler(async (req, res: Response) => {
  const { userId } = (req as AuthenticatedRequest).user!;

  const user = await authService.getMe(userId);

  const response: ApiResponse<typeof user> = {
    success: true,
    data: user,
  };

  res.status(200).json(response);
});

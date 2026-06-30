import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as usersService from '../services/users.service.js';
import {
  AuthenticatedRequest,
  ApiResponse,
  ForbiddenError,
} from '../types/index.js';

// ============================================================================
// Users Controller — HTTP Handlers for User Operations
// ============================================================================

/**
 * GET /users/:id
 * Get a user's public profile.
 */
export const getUserProfile = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;

  const user = await usersService.getUserById(id as string);

  const response: ApiResponse<typeof user> = {
    success: true,
    data: user,
  };

  res.status(200).json(response);
});

/**
 * PUT /users/:id
 * Update a user's profile. Only the user themselves can update their profile.
 */
export const updateProfile = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  const { userId } = (req as AuthenticatedRequest).user!;

  // Only allow users to update their own profile
  if (userId !== id) {
    throw new ForbiddenError('You can only update your own profile');
  }

  const { bio, username } = req.body;

  const user = await usersService.updateUser(id, { bio, username });

  const response: ApiResponse<typeof user> = {
    success: true,
    message: 'Profile updated successfully',
    data: user,
  };

  res.status(200).json(response);
});

/**
 * GET /users/:id/groups
 * Get the study groups a user belongs to (paginated).
 */
export const getUserGroups = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  const { search, page, limit } = req.query;

  const result = await usersService.getUserGroups(id as string, {
    search: search as string | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * GET /users/:id/materials
 * Get the study materials uploaded by a user (paginated).
 */
export const getUserMaterials = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  const { search, page, limit } = req.query;

  const result = await usersService.getUserMaterials(id as string, {
    search: search as string | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

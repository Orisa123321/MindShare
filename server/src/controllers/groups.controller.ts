import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest, ValidationError } from '../types/index.js';
import * as groupsService from '../services/groups.service.js';

// ============================================================================
// Study Groups Controller
// ============================================================================

/** POST / — Create a new study group */
export const createGroup = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { title, description } = req.body;

  if (!title) {
    throw new ValidationError('Title is required');
  }

  const group = await groupsService.createGroup(user!.userId, { title, description });

  res.status(201).json({
    success: true,
    data: group,
    message: 'Study group created successfully',
  });
});

/** GET / — List study groups with search & pagination */
export const getGroups = asyncHandler(async (req, res: Response) => {
  const { search, page, limit } = req.query;

  const result = await groupsService.getGroups({
    search: search as string | undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/** GET /:id — Get a single study group */
export const getGroupById = asyncHandler(async (req, res: Response) => {
  const group = await groupsService.getGroupById(req.params.id as string);

  res.json({
    success: true,
    data: group,
  });
});

/** PUT /:id — Update a study group */
export const updateGroup = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { title, description } = req.body;

  const group = await groupsService.updateGroup(req.params.id as string, user!.userId, {
    title,
    description,
  });

  res.json({
    success: true,
    data: group,
    message: 'Study group updated successfully',
  });
});

/** DELETE /:id — Delete a study group */
export const deleteGroup = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  await groupsService.deleteGroup(req.params.id as string, user!.userId);

  res.json({
    success: true,
    message: 'Study group deleted successfully',
  });
});

/** POST /:id/join — Join a study group */
export const joinGroup = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const membership = await groupsService.joinGroup(req.params.id as string, user!.userId);

  res.status(201).json({
    success: true,
    data: membership,
    message: 'Joined group successfully',
  });
});

/** DELETE /:id/leave — Leave a study group */
export const leaveGroup = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  await groupsService.leaveGroup(req.params.id as string, user!.userId);

  res.json({
    success: true,
    message: 'Left group successfully',
  });
});

/** GET /:id/members — List group members */
export const getGroupMembers = asyncHandler(async (req, res: Response) => {
  const members = await groupsService.getGroupMembers(req.params.id as string);

  res.json({
    success: true,
    data: members,
  });
});

/** GET /:id/materials — List group materials */
export const getGroupMaterials = asyncHandler(async (req, res: Response) => {
  const { search, page, limit } = req.query;

  const result = await groupsService.getGroupMaterials(req.params.id as string, {
    search: search as string | undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

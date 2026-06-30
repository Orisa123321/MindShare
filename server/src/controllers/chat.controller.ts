import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/index.js';
import * as chatService from '../services/chat.service.js';
import * as groupsService from '../services/groups.service.js';

export const getGroupMessages = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { groupId } = req.params;

  // Verify group exists first
  await groupsService.getGroupById(groupId);

  const messages = await chatService.getGroupMessages(groupId);

  res.json({
    success: true,
    data: messages,
  });
});

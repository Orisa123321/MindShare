import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';

export const getDashboardStats = asyncHandler(async (req, res: Response) => {
  const stats = await analyticsService.getDashboardStats();

  res.json({
    success: true,
    data: stats,
  });
});

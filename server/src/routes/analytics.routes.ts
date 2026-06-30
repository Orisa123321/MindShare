import { Router } from 'express';
import { getDashboardStats } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);

export default router;

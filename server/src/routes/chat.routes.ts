import { Router } from 'express';
import { getGroupMessages } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/groups/:groupId/messages', authenticate, getGroupMessages);

export default router;

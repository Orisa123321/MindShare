import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as usersController from '../controllers/users.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateUserSchema } from '../schemas/index.js';
// ============================================================================
// Users Routes — /api/users
// ============================================================================

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/:id', usersController.getUserProfile);
router.put('/:id', validate(updateUserSchema), usersController.updateProfile);
router.get('/:id/groups', usersController.getUserGroups);
router.get('/:id/materials', usersController.getUserMaterials);

export default router;

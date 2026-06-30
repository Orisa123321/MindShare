import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as groupsController from '../controllers/groups.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createGroupSchema, updateGroupSchema } from '../schemas/index.js';
// ============================================================================
// Study Groups Routes
// ============================================================================

const router = Router();

// All group routes require authentication
router.use(authenticate);

router.post('/', validate(createGroupSchema), groupsController.createGroup);
router.get('/', groupsController.getGroups);
router.get('/:id', groupsController.getGroupById);
router.put('/:id', validate(updateGroupSchema), groupsController.updateGroup);
router.delete('/:id', groupsController.deleteGroup);

router.post('/:id/join', groupsController.joinGroup);
router.delete('/:id/leave', groupsController.leaveGroup);
router.get('/:id/members', groupsController.getGroupMembers);
router.get('/:id/materials', groupsController.getGroupMaterials);

export default router;

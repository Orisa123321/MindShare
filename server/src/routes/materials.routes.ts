import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadMaterial as uploadMiddleware } from '../middleware/upload.middleware.js';
import * as materialsController from '../controllers/materials.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadMaterialSchema } from '../schemas/index.js';
// ============================================================================
// Study Materials Routes
// ============================================================================

const router = Router();

// All material routes require authentication
router.use(authenticate);

// Search must be registered BEFORE /:id to avoid "search" being parsed as an id
router.get('/search', materialsController.searchAll);

router.post('/', uploadMiddleware, validate(uploadMaterialSchema), materialsController.uploadMaterial);
router.get('/', materialsController.getMaterials);
router.get('/:id', materialsController.getMaterialById);
router.post('/:id/summarize', materialsController.summarizeMaterial);
router.delete('/:id', materialsController.deleteMaterial);

export default router;

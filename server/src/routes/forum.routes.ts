import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as forumController from '../controllers/forum.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createQuestionSchema, createAnswerSchema, voteSchema } from '../schemas/index.js';
// ============================================================================
// Forum Routes — Questions, Answers & Voting
// ============================================================================

const router = Router();

// All forum routes require authentication
router.use(authenticate);

// --------------------------------------------------------------------------
// Questions
// --------------------------------------------------------------------------

router.post('/questions', validate(createQuestionSchema), forumController.createQuestion);
router.get('/questions', forumController.getQuestions);
router.get('/questions/:id', forumController.getQuestionById);
router.delete('/questions/:id', forumController.deleteQuestion);

// --------------------------------------------------------------------------
// Answers
// --------------------------------------------------------------------------

router.post('/questions/:id/answers', validate(createAnswerSchema), forumController.createAnswer);
router.post('/questions/:id/ai-answer', forumController.generateAIAnswer);
router.delete('/answers/:id', forumController.deleteAnswer);

// --------------------------------------------------------------------------
// Voting
// --------------------------------------------------------------------------

router.post('/answers/:id/vote', validate(voteSchema), forumController.voteOnAnswer);

export default router;

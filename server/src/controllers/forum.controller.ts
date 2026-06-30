import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/index.js';
import * as forumService from '../services/forum.service.js';
import { geminiService } from '../services/ai.service.js';
import { aiConfig } from '../config/ai.config.js';
import { getIO } from '../config/socket.config.js';

// ============================================================================
// Forum Controller — Questions, Answers & Voting
// ============================================================================

// --------------------------------------------------------------------------
// Questions
// --------------------------------------------------------------------------

/** POST /questions — Create a new question */
export const createQuestion = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { title, content } = req.body;

  const question = await forumService.createQuestion(user!.userId, {
    title,
    content,
  });

  res.status(201).json({
    success: true,
    data: question,
    message: 'Question created successfully',
  });
});

/** GET /questions — List questions with search & pagination */
export const getQuestions = asyncHandler(async (req, res: Response) => {
  const search = req.query.search as string | undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await forumService.getQuestions({ search, page, limit });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/** GET /questions/:id — Get a single question with answers */
export const getQuestionById = asyncHandler(async (req, res: Response) => {
  const question = await forumService.getQuestionById(req.params.id as string);

  res.json({
    success: true,
    data: question,
  });
});

/** DELETE /questions/:id — Delete a question (author only) */
export const deleteQuestion = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  await forumService.deleteQuestion(req.params.id as string, user!.userId);

  res.json({
    success: true,
    message: 'Question deleted successfully',
  });
});

// --------------------------------------------------------------------------
// Answers
// --------------------------------------------------------------------------

/** POST /questions/:id/answers — Create an answer on a question */
export const createAnswer = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { content } = req.body;

  const answer = await forumService.createAnswer(
    req.params.id as string,
    user!.userId,
    { content }
  );

  // Emit event to room
  try {
    getIO().to(`question_${req.params.id}`).emit('new_answer', answer);
  } catch (e) {
    console.error('Socket emit error:', e);
  }

  res.status(201).json({
    success: true,
    data: answer,
    message: 'Answer created successfully',
  });
});

/** DELETE /answers/:id — Delete an answer (author only) */
export const deleteAnswer = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  await forumService.deleteAnswer(req.params.id as string, user!.userId);

  res.json({
    success: true,
    message: 'Answer deleted successfully',
  });
});

// --------------------------------------------------------------------------
// Voting
// --------------------------------------------------------------------------

/** POST /questions/:id/ai-answer — Generate AI answer for a question */
export const generateAIAnswer = asyncHandler(async (req, res: Response) => {
  if (!aiConfig.enabled) {
    res.status(400).json({ success: false, message: 'AI features are disabled' });
    return;
  }
  
  const question = await forumService.getQuestionById(req.params.id as string);
  
  // Create an AI generated answer using Gemini
  const answerContent = await geminiService.generateAnswer(question.title + '\n\n' + question.content);
  
  // We need an "AI user" ID, or we can just associate it with the question creator but mark it as AI.
  // Actually, let's create a dedicated system user for AI, or store a flag `isAiGenerated`.
  // Wait, the DB schema has `isAiGenerated` field in `ForumAnswer`!
  // I need to update `forumService.createAnswer` to accept `isAiGenerated`.
  
  // For now, let's just pass `isAiGenerated: true` down. We need to check if the user is required.
  const { user } = req as AuthenticatedRequest;
  
  const answer = await forumService.createAnswer(
    question.id,
    user!.userId, // The user who requested the AI answer
    { content: answerContent, isAiGenerated: true }
  );

  // Emit event to room
  try {
    getIO().to(`question_${question.id}`).emit('new_answer', answer);
  } catch (e) {
    console.error('Socket emit error:', e);
  }

  res.status(201).json({
    success: true,
    data: answer,
    message: 'AI Answer generated successfully',
  });
});

// --------------------------------------------------------------------------

/** POST /answers/:id/vote — Vote on an answer (upsert / toggle) */
export const voteOnAnswer = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { value } = req.body;

  const voteScore = await forumService.voteOnAnswer(
    req.params.id as string,
    user!.userId,
    value
  );

  res.json({
    success: true,
    data: { voteScore },
    message: 'Vote recorded successfully',
  });
});

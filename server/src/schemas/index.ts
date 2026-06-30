import { z } from 'zod';

// ============================================================================
// Auth Schemas
// ============================================================================

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// ============================================================================
// User Schemas
// ============================================================================

export const updateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).optional(),
    bio: z.string().max(500).optional(),
  }),
});

// ============================================================================
// Group Schemas
// ============================================================================

export const createGroupSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().max(1000).optional(),
  }),
});

// ============================================================================
// Material Schemas
// ============================================================================

export const uploadMaterialSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150),
    group_id: z.string().uuid().optional(),
  }),
});

// ============================================================================
// Forum Schemas
// ============================================================================

export const createQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    content: z.string().min(10).max(5000),
  }),
});

export const createAnswerSchema = z.object({
  body: z.object({
    content: z.string().min(5).max(5000),
  }),
});

export const voteSchema = z.object({
  body: z.object({
    value: z.union([z.literal(1), z.literal(-1)]),
  }),
});

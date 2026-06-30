import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  AuthenticatedRequest,
  ValidationError,
} from '../types/index.js';
import { getFileUrl } from '../middleware/upload.middleware.js';
import * as materialsService from '../services/materials.service.js';
import { geminiService } from '../services/ai.service.js';
import { aiConfig } from '../config/ai.config.js';

// ============================================================================
// Study Materials Controller
// ============================================================================

/** POST / — Upload a new study material */
export const uploadMaterial = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const file = req.file;

  if (!file) {
    throw new ValidationError('File is required');
  }

  const { title, group_id } = req.body;

  if (!title) {
    throw new ValidationError('Title is required');
  }

  const material = await materialsService.createMaterial({
    title,
    fileName: file.originalname,
    fileUrl: getFileUrl(file),
    fileSize: file.size,
    mimeType: file.mimetype,
    uploadedById: user!.userId,
    groupId: group_id || undefined,
  });

  res.status(201).json({
    success: true,
    data: material,
    message: 'Material uploaded successfully',
  });
});

/** GET / — List materials with optional search & group filter */
export const getMaterials = asyncHandler(async (req, res: Response) => {
  const { search, page, limit, group_id } = req.query;

  const result = await materialsService.getMaterials({
    search: search as string | undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    group_id: group_id as string | undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/** GET /:id — Get a single material */
export const getMaterialById = asyncHandler(async (req, res: Response) => {
  const material = await materialsService.getMaterialById(req.params.id as string);

  res.json({
    success: true,
    data: material,
  });
});

/** DELETE /:id — Delete a material */
export const deleteMaterial = asyncHandler(async (req, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  await materialsService.deleteMaterial(req.params.id as string, user!.userId);

  res.json({
    success: true,
    message: 'Material deleted successfully',
  });
});

/** POST /:id/summarize — Summarize a material using AI */
export const summarizeMaterial = asyncHandler(async (req, res: Response) => {
  if (!aiConfig.enabled) {
    res.status(400).json({ success: false, message: 'AI features are disabled' });
    return;
  }

  const material = await materialsService.getMaterialById(req.params.id as string);
  
  // Extract text from file (PDF or plain text)
  const extractedText = await materialsService.extractTextFromMaterial(material.fileUrl, material.mimeType);
  
  let promptContext = '';
  if (extractedText && extractedText.trim().length > 0) {
    promptContext = `Here is the actual text extracted from the study material titled "${material.title}":\n\n${extractedText}`;
  } else {
    // Fallback if extraction failed or file type doesn't support extraction
    promptContext = `Provide a summary based on the metadata. Title: "${material.title}". File Name: "${material.fileName}". (The full file content could not be read directly).`;
  }
  
  const summary = await geminiService.summarize(promptContext);
  
  res.json({
    success: true,
    data: { summary },
    message: 'Material summarized successfully',
  });
});

/** GET /search — Global search across groups, materials, and questions */
export const searchAll = asyncHandler(async (req, res: Response) => {
  const { q, page, limit } = req.query;

  if (!q) {
    throw new ValidationError('Search query parameter "q" is required');
  }

  const result = await materialsService.searchAll(
    q as string,
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 10
  );

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

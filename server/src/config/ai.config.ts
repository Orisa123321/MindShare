// ============================================================================
// AI Configuration
// ============================================================================
// Feature flags and configuration for future LLM integration.
// Currently disabled — will be activated when AI features are ready.
//
// Integration points:
//   1. Material summarization → services/materials.service.ts
//   2. AI-generated forum answers → services/questions.service.ts
// ============================================================================

import { AIConfig } from '../types/index.js';

export const aiConfig: AIConfig = {
  enabled: process.env.AI_ENABLED === 'true',
  provider: (process.env.AI_PROVIDER as AIConfig['provider']) || 'groq',
  // Support Groq (free), Gemini, or OpenAI — first defined wins
  apiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
};

/**
 * Check if AI features are enabled and properly configured.
 * Use this guard before calling any AI service functions.
 */
export function isAIEnabled(): boolean {
  return aiConfig.enabled && !!aiConfig.provider && !!aiConfig.apiKey;
}

/**
 * Future: AI service interface that providers must implement.
 * This allows easy swapping between OpenAI, Gemini, or other providers.
 */
export interface AIServiceProvider {
  summarize(text: string): Promise<string>;
  extractTags(text: string): Promise<string[]>;
  generateAnswer(question: string, context?: string): Promise<string>;
}

export default aiConfig;

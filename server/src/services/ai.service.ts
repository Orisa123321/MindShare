import Groq from 'groq-sdk';
import { AIServiceProvider, aiConfig } from '../config/ai.config.js';

// Initialize Groq client (free tier — llama3-8b-8192)
const groqClient = new Groq({
  apiKey: aiConfig.apiKey || process.env.GROQ_API_KEY || '',
});

const MODEL = 'llama3-8b-8192';

export const geminiService: AIServiceProvider = {
  async summarize(text: string): Promise<string> {
    if (!aiConfig.apiKey) throw new Error('AI features are disabled or missing API key');

    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Summarize study materials clearly and concisely. Use bullet points where helpful.',
        },
        {
          role: 'user',
          content: `Summarize the following study material concisely:\n\n${text}`,
        },
      ],
      max_tokens: 512,
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content ?? 'Could not generate summary.';
  },

  async extractTags(text: string): Promise<string[]> {
    if (!aiConfig.apiKey) throw new Error('AI features are disabled or missing API key');

    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a tagging assistant. Return ONLY a comma-separated list of 3-5 relevant tags. No extra text.',
        },
        {
          role: 'user',
          content: `Extract tags from:\n\n${text}`,
        },
      ],
      max_tokens: 64,
      temperature: 0.3,
    });

    const tagsText = completion.choices[0]?.message?.content ?? '';
    return tagsText.split(',').map((tag) => tag.trim()).filter(Boolean);
  },

  async generateAnswer(question: string, context?: string): Promise<string> {
    if (!aiConfig.apiKey) throw new Error('AI features are disabled or missing API key');

    const systemPrompt = 'You are a helpful study assistant on a platform called StudyShare. Provide clear, detailed, and accurate answers. Format your response in Markdown.';

    let userPrompt = `Question: ${question}`;
    if (context) {
      userPrompt += `\n\nContext:\n${context}`;
    }

    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? 'Could not generate an answer.';
  },
};

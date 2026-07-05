import { registerAs } from '@nestjs/config';

export default registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.1'),
  maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048', 10),

  topP: 0.95,
  topK: 40,
}));

import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

export const GEMINI_CLIENT = 'GEMINI_CLIENT';

export const GeminiProvider = {
  provide: GEMINI_CLIENT,
  useFactory: (configService: ConfigService) => {
    return new GoogleGenAI({
      apiKey: configService.get<string>('gemini.apiKey'),
      apiVersion: 'v1',
    });
  },
  inject: [ConfigService],
};

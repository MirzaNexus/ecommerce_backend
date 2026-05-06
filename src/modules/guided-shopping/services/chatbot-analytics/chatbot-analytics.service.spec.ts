import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotAnalyticsService } from './chatbot-analytics.service';

describe('ChatbotAnalyticsService', () => {
  let service: ChatbotAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotAnalyticsService],
    }).compile();

    service = module.get<ChatbotAnalyticsService>(ChatbotAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GeminiIntegrationService } from './gemini-integration.service';

describe('GeminiIntegrationService', () => {
  let service: GeminiIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiIntegrationService],
    }).compile();

    service = module.get<GeminiIntegrationService>(GeminiIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

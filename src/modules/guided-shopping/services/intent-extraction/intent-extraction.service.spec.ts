import { Test, TestingModule } from '@nestjs/testing';
import { IntentExtractionService } from './intent-extraction.service';

describe('IntentExtractionService', () => {
  let service: IntentExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntentExtractionService],
    }).compile();

    service = module.get<IntentExtractionService>(IntentExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

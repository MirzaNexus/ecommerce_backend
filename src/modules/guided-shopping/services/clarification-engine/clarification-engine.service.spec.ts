import { Test, TestingModule } from '@nestjs/testing';
import { ClarificationEngineService } from './clarification-engine.service';

describe('ClarificationEngineService', () => {
  let service: ClarificationEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClarificationEngineService],
    }).compile();

    service = module.get<ClarificationEngineService>(ClarificationEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

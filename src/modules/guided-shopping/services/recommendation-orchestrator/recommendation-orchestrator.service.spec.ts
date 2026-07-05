import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationOrchestratorService } from './recommendation-orchestrator.service';

describe('RecommendationOrchestratorService', () => {
  let service: RecommendationOrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecommendationOrchestratorService],
    }).compile();

    service = module.get<RecommendationOrchestratorService>(RecommendationOrchestratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

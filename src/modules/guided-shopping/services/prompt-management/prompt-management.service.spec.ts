import { Test, TestingModule } from '@nestjs/testing';
import { PromptManagementService } from './prompt-management.service';

describe('PromptManagementService', () => {
  let service: PromptManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptManagementService],
    }).compile();

    service = module.get<PromptManagementService>(PromptManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PromptManagementController } from './prompt-management.controller';

describe('PromptManagementController', () => {
  let controller: PromptManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromptManagementController],
    }).compile();

    controller = module.get<PromptManagementController>(PromptManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

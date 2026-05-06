import { Test, TestingModule } from '@nestjs/testing';
import { AdminRuleController } from './admin-rule.controller';

describe('AdminRuleController', () => {
  let controller: AdminRuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminRuleController],
    }).compile();

    controller = module.get<AdminRuleController>(AdminRuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

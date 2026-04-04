import { Test, TestingModule } from '@nestjs/testing';
import { AdminTsController } from './admin-user.controller';

describe('AdminTsController', () => {
  let controller: AdminTsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTsController],
    }).compile();

    controller = module.get<AdminTsController>(AdminTsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

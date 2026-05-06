import { Test, TestingModule } from '@nestjs/testing';
import { GuidedShoppingController } from './guided-shopping.controller';
import { GuidedShoppingService } from '../services/guided-shopping.service';

describe('GuidedShoppingController', () => {
  let controller: GuidedShoppingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuidedShoppingController],
      providers: [GuidedShoppingService],
    }).compile();

    controller = module.get<GuidedShoppingController>(GuidedShoppingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

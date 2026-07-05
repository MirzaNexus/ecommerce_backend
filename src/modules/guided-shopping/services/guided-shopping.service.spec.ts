import { Test, TestingModule } from '@nestjs/testing';
import { GuidedShoppingService } from './guided-shopping.service';

describe('GuidedShoppingService', () => {
  let service: GuidedShoppingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuidedShoppingService],
    }).compile();

    service = module.get<GuidedShoppingService>(GuidedShoppingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

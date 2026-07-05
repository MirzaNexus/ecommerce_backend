import { Test, TestingModule } from '@nestjs/testing';
import { ProductSearchServiceService } from './product-search-service.service';

describe('ProductSearchServiceService', () => {
  let service: ProductSearchServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSearchServiceService],
    }).compile();

    service = module.get<ProductSearchServiceService>(ProductSearchServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

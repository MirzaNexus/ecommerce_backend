import { Test, TestingModule } from '@nestjs/testing';
import { AddressTsService } from './user-address.service';

describe('AddressTsService', () => {
  let service: AddressTsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressTsService],
    }).compile();

    service = module.get<AddressTsService>(AddressTsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

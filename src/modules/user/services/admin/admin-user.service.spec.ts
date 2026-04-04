import { Test, TestingModule } from '@nestjs/testing';
import { AdminTsService } from './admin-user.service';

describe('AdminTsService', () => {
  let service: AdminTsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminTsService],
    }).compile();

    service = module.get<AdminTsService>(AdminTsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

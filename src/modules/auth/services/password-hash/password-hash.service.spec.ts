import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashService } from './password-hash.service';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHashService],
    }).compile();

    service = module.get<PasswordHashService>(PasswordHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

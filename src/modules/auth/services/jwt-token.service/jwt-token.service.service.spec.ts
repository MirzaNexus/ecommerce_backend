import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenServiceService } from './jwt-token.service.service';

describe('JwtTokenServiceService', () => {
  let service: JwtTokenServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtTokenServiceService],
    }).compile();

    service = module.get<JwtTokenServiceService>(JwtTokenServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

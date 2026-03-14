import { Test, TestingModule } from '@nestjs/testing';
import { AddressTsController } from './user-address.controller';

describe('AddressTsController', () => {
  let controller: AddressTsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressTsController],
    }).compile();

    controller = module.get<AddressTsController>(AddressTsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

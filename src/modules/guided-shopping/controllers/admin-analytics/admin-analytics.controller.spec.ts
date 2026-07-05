import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsController } from './admin-analytics.controller';

describe('AdminAnalyticsController', () => {
  let controller: AdminAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAnalyticsController],
    }).compile();

    controller = module.get<AdminAnalyticsController>(AdminAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

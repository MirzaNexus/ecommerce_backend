import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { UserCategoryAffinity } from './entities/user-category-affinity.entity';
import { RecommendationSettings } from './entities/recommendation-settings.entity';
import { RecommendationEvent } from './entities/recommendation-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlgoliaModule } from '../algolia/algolia.module';
import { ProductsModule } from '../products/products.module';
import { RecommendationAdminController } from './recommendationAdmin.controller';
import { RecommendationIndexer } from './recommendation-indexer.service';
import { RecommendationSettingsRepository } from './repositories/recommendationSettingsRepository';
import { RecommendationEventRepository } from './repositories/recommendationEventRepository';
import { UserCategoryAffinityRepository } from './repositories/userCategoryAffinityRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationEvent,
      RecommendationSettings,
      UserCategoryAffinity,
    ]),
    AlgoliaModule,
    ProductsModule,
  ],
  controllers: [RecommendationController, RecommendationAdminController],
  providers: [
    RecommendationService,
    RecommendationIndexer,
    RecommendationSettingsRepository,
    RecommendationEventRepository,
    UserCategoryAffinityRepository,
  ],
  exports: [RecommendationService],
})
export class RecommendationModule {}

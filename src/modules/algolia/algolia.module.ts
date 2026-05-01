import { Module, Global } from '@nestjs/common';
import {
  ALGOLIA_INSIGHTS_CLIENT,
  ALGOLIA_CLIENT,
  AlgoliaInsightsProvider,
  AlgoliaProvider,
} from './algolia.provider';
import { AlgoliaService } from './algolia.service';

@Global() // Optional: Makes ALGOLIA_CLIENT available everywhere without re-importing
@Module({
  providers: [AlgoliaProvider, AlgoliaInsightsProvider, AlgoliaService],
  exports: [
    AlgoliaProvider,
    AlgoliaInsightsProvider,
    AlgoliaService,
    ALGOLIA_CLIENT,
    ALGOLIA_INSIGHTS_CLIENT,
  ],
})
export class AlgoliaModule {}

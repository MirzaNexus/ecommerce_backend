import { Module, Global } from '@nestjs/common';
import {
  ALGOLIA_INSIGHTS_CLIENT,
  ALGOLIA_CLIENT,
  AlgoliaInsightsProvider,
  AlgoliaProvider,
} from './algolia.provider';

@Global() // Optional: Makes ALGOLIA_CLIENT available everywhere without re-importing
@Module({
  providers: [AlgoliaProvider, AlgoliaInsightsProvider],
  exports: [
    AlgoliaProvider,
    AlgoliaInsightsProvider,
    ALGOLIA_CLIENT,
    ALGOLIA_INSIGHTS_CLIENT,
  ],
})
export class AlgoliaModule {}

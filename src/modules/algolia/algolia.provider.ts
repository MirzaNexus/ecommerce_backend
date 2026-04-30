import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { algoliasearch, insightsClient, SearchClient } from 'algoliasearch';

export const ALGOLIA_CLIENT = 'ALGOLIA_CLIENT';
export const ALGOLIA_INSIGHTS_CLIENT = 'ALGOLIA_INSIGHTS_CLIENT';

export const AlgoliaProvider: Provider = {
  provide: ALGOLIA_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): SearchClient => {
    const appId = configService.get<string>('ALGOLIA_APP_ID');
    const adminKey = configService.get<string>('ALGOLIA_ADMIN_KEY');
    if (!appId || !adminKey) {
      throw new Error(
        'Algolia configuration is missing! Check your .env file.',
      );
    }
    return algoliasearch(appId, adminKey);
  },
};

export const AlgoliaInsightsProvider: Provider = {
  provide: ALGOLIA_INSIGHTS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const appId = configService.getOrThrow<string>('ALGOLIA_APP_ID');
    const adminKey = configService.getOrThrow<string>('ALGOLIA_ADMIN_KEY');
    return insightsClient(appId, adminKey);
  },
};

import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import * as algoliasearch from 'algoliasearch';
import {
  ALGOLIA_CLIENT,
  ALGOLIA_INSIGHTS_CLIENT,
} from '../algolia/algolia.provider';

// Repositories from Phase 2

import { RecommendationEventRepository } from './repositories/recommendationEventRepository';
import { UserCategoryAffinityRepository } from './repositories/userCategoryAffinityRepository';
import { RecommendationSettingsRepository } from './repositories/recommendationSettingsRepository';

// DTOs & Enums
import { CreateRecommendationEventDto } from './dto/recommendation-event/create-recommendation-event.dto';
import { RecommendationListResponseDto } from './dto/recommendedProductResponseDto';
import { RecommendationEventType } from './enum/recommendation-event-type.enum';
import { ProductService } from '../products/services/products.service';
import { ConfigService } from '@nestjs/config';
import { UserCategoryAffinity } from './entities/user-category-affinity.entity';
import { CreateRecommendationSettingsDto } from './dto/recommendation-settings/create-recommendation-settings.dto';
import { RecommendationIndexer } from './recommendation-indexer.service';
import { RecommendationSettings } from './entities/recommendation-settings.entity';
import { SyncJobResultDto } from './dto/syncJobResultDto';
import { AlgoliaPayload } from './interface/algolia-payload.interface';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @Inject(ALGOLIA_CLIENT)
    private readonly algoliaClient: algoliasearch.SearchClient,
    @Inject(ALGOLIA_INSIGHTS_CLIENT)
    private readonly insightsClient: any,
    private readonly eventRepo: RecommendationEventRepository,
    private readonly affinityRepo: UserCategoryAffinityRepository,
    private readonly settingsRepo: RecommendationSettingsRepository,
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
    private readonly indexer: RecommendationIndexer,
  ) {}

  async getRecommendedProducts(
    productId: string,
    categoryId: string,
    userId?: string,
    page: number = 1,
  ): Promise<RecommendationListResponseDto> {
    const settings = await this.settingsRepo.getActiveSettings();
    const limit = settings?.related_products_limit || 4;
    const offset = (page - 1) * limit;

    if (!settings?.enabled) {
      return this.getInternalFallback(categoryId, productId, limit, page);
    }

    try {
      const indexName =
        this.configService.getOrThrow<string>('ALGOLIA_INDEX_NAME');

      const { hits, nbHits, nbPages } =
        await this.algoliaClient.searchSingleIndex({
          indexName: indexName,
          searchParams: {
            query: '',
            filters: `category_id:${categoryId} AND NOT objectID:${productId}`,
            hitsPerPage: limit,
            page: page - 1,
            userToken: userId,
          },
        });

      return {
        items: hits.map((h: any) => this.mapAlgoliaHitToDto(h)),
        total: nbHits ?? 0,
        totalPages: nbPages ?? 0,
        source: 'algolia',
        request_id: `req_${Date.now()}_pg${page}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Algolia failed, falling back: ${errorMessage}`);

      // Fallback to internal database
      return this.getInternalFallback(categoryId, productId, limit, page);
    }
  }

  async trackConversion(dto: CreateRecommendationEventDto): Promise<void> {
    const quantity = dto.quantity || 1;

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const algoliaPayload: AlgoliaPayload = {
        eventName: dto.event_type,
        userToken: dto.user_id,
        index: this.configService.get<string>('ALGOLIA_INDEX_NAME') || '',
        objectIDs: [dto.product_id],
        timestamp: Date.now(),
        ...dto.algolia_payload, // Merge any extra frontend metadata (e.g. queryID)
      };

      await this.eventRepo.create(
        {
          ...dto,
          quantity,
          algolia_payload: algoliaPayload,
        },
        manager,
      );

      let affinity: UserCategoryAffinity | null =
        await this.affinityRepo.findByUserAndCategory(
          dto.user_id,
          dto.category_id,
          manager,
        );

      if (!affinity) {
        affinity = this.affinityRepo.create(
          {
            user_id: dto.user_id,
            category_id: dto.category_id,
            view_count: 0,
            add_to_cart_count: 0,
            purchase_count: 0,
            affinity_score: 0,
          },
          manager,
        );
      }

      if (dto.event_type === RecommendationEventType.VIEW) {
        affinity.view_count += 1;
      } else if (dto.event_type === RecommendationEventType.ADD_TO_CART) {
        affinity.add_to_cart_count += quantity;
      } else if (dto.event_type === RecommendationEventType.PAID_ORDER) {
        affinity.purchase_count += quantity;
      }
      affinity.affinity_score =
        affinity.view_count * 1 +
        affinity.add_to_cart_count * 3 +
        affinity.purchase_count * 10;

      await this.affinityRepo.upsertAffinity(affinity, manager);
    });

    this.sendToAlgoliaInsights(dto).catch((err) =>
      this.logger.error(`Algolia Insights Sync Failed: ${err.message}`),
    );
  }

  private async getInternalFallback(
    categoryId: string,
    excludeId: string,
    limit: number = 4,
    page: number = 1,
  ): Promise<RecommendationListResponseDto> {
    const offset = (page - 1) * limit;

    const [products, total] = await this.productService.getRelatedByCategory(
      categoryId,
      excludeId,
      limit,
      offset,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      items: products.map((p) => this.mapProductToDto(p)),
      total,
      totalPages: totalPages || 0,
      source: 'fallback_db',
      request_id: `fallback_${Date.now()}_p${page}`,
    };
  }

  private async sendToAlgoliaInsights(dto: CreateRecommendationEventDto) {
    try {
      const indexName =
        this.configService.getOrThrow<string>('ALGOLIA_INDEX_NAME');

      await this.insightsClient.pushEvents({
        events: [
          {
            eventType:
              dto.event_type === RecommendationEventType.PAID_ORDER
                ? 'conversion'
                : 'click',
            eventName: `Product ${dto.event_type}`,
            index: indexName,
            userToken: dto.user_id,
            objectIDs: [dto.product_id],
            timestamp: Date.now(),
          },
        ],
      });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Unknown Insights Error';
      this.logger.warn(`Failed to send Algolia Insights: ${msg}`);
    }
  }

  private mapProductToDto(p: any) {
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      category_id: p.category?.id || p.category_id,
      image_url: p.image_url,
      recommendation_score: 0, // Database fallback doesn't have AI scoring
    };
  }

  private mapAlgoliaHitToDto(h: any) {
    return {
      id: h.objectID,
      name: h.name,
      price: h.price,
      category_id: h.category_id,
      image_url: h.image_url,
      recommendation_score: h._rankingInfo?.userScore || 0,
    };
  }

  // Admin methods to update settings could be added here in the future

  async updateConfiguration(
    dto: CreateRecommendationSettingsDto,
  ): Promise<RecommendationSettings> {
    try {
      const updatedSettings = await this.settingsRepo.upsertSettings(dto);
      return updatedSettings;
    } catch (error) {
      this.logger.error(
        `Configuration update failed: ${(error as any).message}`,
      );
      throw error;
    }
  }

  async fullReindex(): Promise<SyncJobResultDto> {
    const startTime = Date.now();
    const indexName =
      this.configService.getOrThrow<string>('ALGOLIA_INDEX_NAME');

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        const products =
          await this.productService.findAllForRecommendationSync(manager);

        if (!products || products.length === 0) {
          this.logger.warn('No active products found for indexing.');
          return {
            success: true,
            total_processed: 0,
            timestamp: new Date(),
            index_name: indexName,
            execution_time_ms: Date.now() - startTime,
          };
        }
        const algoliaObjects = products.map((p) =>
          this.indexer.formatProductForAlgolia(p),
        );

        await this.algoliaClient.saveObjects({
          indexName: indexName,
          objects: algoliaObjects,
        });

        const executionTime = Date.now() - startTime;

        return {
          success: true,
          total_processed: algoliaObjects.length,
          timestamp: new Date(),
          index_name: indexName,
          execution_time_ms: executionTime,
        };
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : 'Unknown sync error';
        this.logger.error(`Algolia Sync Failed: ${msg}`);
        throw new Error(`Sync Job Failed: ${msg}`);
      }
    });
  }

  async getSystemHealthMetrics() {
    const topCategories = await this.affinityRepo.getGlobalTopCategories(5);

    return {
      top_categories: topCategories,
      last_sync: new Date(),
    };
  }

  //Algolia Serach
  async searchProducts(query: string, userId?: string): Promise<any> {
    try {
      const indexName =
        this.configService.getOrThrow<string>('ALGOLIA_INDEX_NAME');

      const { hits } = await this.algoliaClient.searchSingleIndex({
        indexName: indexName,
        searchParams: {
          query: query,
          hitsPerPage: 12,
          userToken: userId,
          getRankingInfo: true,
          facets: ['category_id', 'price'],
        },
      });

      return {
        results: hits.map((h) => this.mapAlgoliaHitToDto(h)),
        total: hits.length,
        query: query,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${(error as any).message}`);
      throw new InternalServerErrorException(
        'Search service temporarily unavailable',
      );
    }
  }
}

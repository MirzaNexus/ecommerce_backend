import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Product } from 'src/modules/products/entities/product.entity';
import { CreateShoppingIntentDto } from '../../dto/shopping-intent.dto';
import { RecommendationRepository } from '../../repositories/recommendationRepository';
import { RecommendationResponseDto } from '../../dto/response/guided-shoping-response.dto';
import { plainToInstance } from 'class-transformer';
import * as lodash from 'lodash';

@Injectable()
export class RecommendationOrchestratorService {
  constructor(private readonly recommendationRepo: RecommendationRepository) {}

  async orchestrate(
    products: Product[],
    intentDto: CreateShoppingIntentDto,
  ): Promise<RecommendationResponseDto> {
    if (!products || products.length === 0) {
      return this.handleZeroResults(intentDto.sessionId);
    }

    const rankedItems = products
      .filter((p) => p.id && p.variants?.length > 0)
      .map((p) => this.rankProduct(p, intentDto));

    const sorted = lodash.orderBy(rankedItems, ['rankingScore'], ['desc']);

    // 3. Persistence: Data ko Entity structure mein map kar ke save karein
    const session = await this.recommendationRepo.createSession({
      sessionId: intentDto.sessionId,
      products: sorted.map((item) => ({
        productId: item.productId,
        rankingScore: item.rankingScore,
        reasoning: item.reasoning,
      })) as any,
    });

    return plainToInstance(RecommendationResponseDto, {
      sessionId: session.id,
      products: sorted,
      totalMatches: sorted.length,
    });
  }

  private rankProduct(product: Product, intentDto: CreateShoppingIntentDto) {
    const primaryVariant = product.variants[0];
    const price = primaryVariant ? Number(primaryVariant.price) : 0;

    let score = 50;
    let reasoningParts = [`Found ${product.name}`];

    if (intentDto.budgetLimit && price <= intentDto.budgetLimit) {
      score += 20;
      reasoningParts.push(`within your budget of ${intentDto.budgetLimit}`);
    }

    const targetBrand =
      intentDto.features?.brand ||
      (intentDto.preferredBrands?.length ? intentDto.preferredBrands[0] : null);

    if (targetBrand && !['NOT_SPECIFIED', 'null'].includes(targetBrand)) {
      if (product.name.toLowerCase().includes(targetBrand.toLowerCase())) {
        score += 15;
        reasoningParts.push(`from your favorite brand ${targetBrand}`);
      }
    }

    if (intentDto.features) {
      const { color, size } = intentDto.features;

      if (color && !['NOT_SPECIFIED', 'null'].includes(color)) {
        const hasColor = product.variants.some((v) => {
          // Flexible key check for 'color' or 'Color'
          const val = v.attributes?.['color'] || v.attributes?.['Color'];
          return val?.toString().toLowerCase() === color.toLowerCase();
        });
        if (hasColor) {
          score += 10;
          reasoningParts.push(`in your preferred ${color} color`);
        }
      }

      if (size && !['NOT_SPECIFIED', 'null'].includes(size)) {
        const hasSize = product.variants.some((v) => {
          const val = v.attributes?.['size'] || v.attributes?.['Size'];
          return val?.toString().toLowerCase() === size.toLowerCase();
        });
        if (hasSize) {
          score += 10;
          reasoningParts.push(`in size ${size}`);
        }
      }
    }

    // if (intentDto.preferredBrands && intentDto.preferredBrands.length > 0) {
    //   const isBrandMatch = intentDto.preferredBrands.some((brand) =>
    //     product.name.toLowerCase().includes(brand.toLowerCase()),
    //   );
    //   if (isBrandMatch) score += 10;
    // }

    return {
      productId: product.id,
      rankingScore: Math.min(score, 100),
      reasoning: reasoningParts.join(' ') + '.',
      // Frontend ke liye variant details bhi bhej sakte hain
      price: price,
      imageUrl: product?.imageUrl || null,
    };
  }

  private handleZeroResults(sessionId: string): RecommendationResponseDto {
    return plainToInstance(RecommendationResponseDto, {
      sessionId: sessionId,
      products: [],
      totalMatches: 0,
      zeroResultReason:
        'Aapke criteria ke mutabiq filhaal koi product available nahi hai. Kya aap budget ya attributes change karna chahenge?',
    });
  }
}

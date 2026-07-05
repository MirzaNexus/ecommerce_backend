import { Injectable } from '@nestjs/common';
import { ShoppingIntent } from '../../entities/shopping-intent.entity';
import { PromptTemplateRepository } from '../../repositories/promptTemplateRepository';
import { TemplateType } from '../../enums/chatbot.enum';
import { ClarificationResponseDto } from '../../dto/response/guided-shoping-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateShoppingIntentDto } from '../../dto/shopping-intent.dto';

@Injectable()
export class ClarificationEngineService {
  constructor(private readonly promptRepo: PromptTemplateRepository) {}

  async getClarification(
    intent: CreateShoppingIntentDto,
    rawIntentType?: string,
  ): Promise<ClarificationResponseDto> {
    if (rawIntentType === 'PRODUCT_INQUIRY' || intent.productIdentifier) {
      return plainToInstance(ClarificationResponseDto, {
        needsClarification: false,
      });
    }

    const missingAttr = this.findMissingAttributes(intent);

    if (!missingAttr) {
      return plainToInstance(ClarificationResponseDto, {
        needsClarification: false,
      });
    }

    const question = await this.generateQuestion(missingAttr, intent);

    return plainToInstance(ClarificationResponseDto, {
      needsClarification: true,
      missingAttribute: missingAttr,
      question,
    });
  }

  private findMissingAttributes(
    intent: CreateShoppingIntentDto,
  ): string | null {
    if (!intent.categoryId) return 'category';

    if (!intent.budgetLimit || intent.budgetLimit <= 0) return 'budget';
    const features = intent.features || {};

    // const hasAnyFeature =
    //   features.color || features.size || intent.preferredBrands;
    // if (!hasAnyFeature) return null;

    if (features.color === null) return 'color';
    if (features.size === null) return 'size';

    return null;
  }

  private async generateQuestion(
    missingAttr: string,
    intent: CreateShoppingIntentDto,
  ): Promise<string> {
    const template = await this.promptRepo.findActiveByType(
      TemplateType.CLARIFICATION,
    );

    const brand = intent.preferredBrands?.[0] || '';

    const defaultQuestions: Record<string, string> = {
      category: brand
        ? `Aap ${brand} mein kya talaash kar rahe hain? (Maslan: Mobile ya Watch)`
        : 'Aap kis tarah ki product talaash kar rahe hain?',
      budget: 'Aapka budget range kya hai?',
      size: 'Aapko kis size mein product chahiye?',
      color: 'Aapka pasandida rang konsa hai?',
    };

    return (
      template?.content?.replace('{{attribute}}', missingAttr) ||
      defaultQuestions[missingAttr]
    );
  }
}

import { Injectable } from '@nestjs/common';
import { ShoppingIntentRepository } from '../../repositories/shoppingIntentRepository';
import { ShoppingIntent } from '../../entities/shopping-intent.entity';
import { IntentExtractionResponseDto } from '../../dto/response/guided-shoping-response.dto';
import { CreateShoppingIntentDto } from '../../dto/shopping-intent.dto';
import { plainToInstance } from 'class-transformer';
import * as lodash from 'lodash';
import { CategoryService } from 'src/modules/products/services/category/category.service';
import { validate as isUUID } from 'uuid';
import { IShoppingFeatures } from '../../enums/chatbot.enum';

@Injectable()
export class IntentExtractionService {
  constructor(
    private readonly intentRepo: ShoppingIntentRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async getCurrentIntent(sessionId: string): Promise<ShoppingIntent | null> {
    return await this.intentRepo.findBySession(sessionId);
  }

  async extractAndSyncIntent(
    sessionId: string,
    aiData: any,
    existingIntent?: ShoppingIntent,
    content?: string,
  ): Promise<IntentExtractionResponseDto> {
    const normalizedData = await this.syncWithProductAttributes(
      sessionId,
      aiData,
      existingIntent,
      content,
    );

    const updatedIntent = await this.intentRepo.upsertIntent(normalizedData);

    const { isComplete, missingFields } =
      this.calculateCompleteness(updatedIntent);

    return plainToInstance(IntentExtractionResponseDto, {
      isComplete,
      missingFields,
      intent: updatedIntent,
    });
  }

  private async syncWithProductAttributes(
    sessionId: string,
    raw: any,
    existing?: ShoppingIntent,
    userRawContent?: string,
  ): Promise<CreateShoppingIntentDto> {
    // 1. Helper function for clean merging
    const mergeValue = (newValue: any, existingValue: any) => {
      if (newValue && newValue !== 'null' && newValue !== 'undefined')
        return newValue;
      return existingValue || null;
    };

    // 2. Clean Attributes Merging
    const mergedFeatures: IShoppingFeatures = {
      brand: mergeValue(raw.features?.brand, existing?.features?.brand),
      color: mergeValue(raw.features?.color, existing?.features?.color),
      size: mergeValue(raw.features?.size, existing?.features?.size),
      attributes: {
        ...(existing?.features?.attributes || {}),
        ...(raw.features?.attributes || {}),
      },
    };

    // 3. Handle "Skip" logic globally
    const userSaidSkip = /(skip|koi bhi|any|kuch bhi)/i.test(
      userRawContent || '',
    );

    if (userSaidSkip) {
      // Sirf un fields ko NOT_SPECIFIED karein jo missing hain
      if (!mergedFeatures.color) mergedFeatures.color = 'NOT_SPECIFIED';
      if (!mergedFeatures.size) mergedFeatures.size = 'NOT_SPECIFIED';
    }

    const categoryUUID = raw.category
      ? await this.mapCategoryToUUID(raw.category)
      : existing?.categoryId;

    return plainToInstance(CreateShoppingIntentDto, {
      sessionId,
      productIdentifier:
        raw.productIdentifier || existing?.productIdentifier || null,
      categoryId: categoryUUID || null,
      budgetLimit: raw.budgetLimit
        ? Number(raw.budgetLimit)
        : existing?.budgetLimit || null,
      features: mergedFeatures,
      extractionConfidence: 0.9,
    });
  }

  private calculateCompleteness(intent: ShoppingIntent): {
    isComplete: boolean;
    missingFields: string[];
  } {
    const required = ['categoryId', 'budgetLimit', 'productIdentifier'];
    const missingFields: string[] = [];

    required.forEach((field) => {
      if (!intent[field as keyof ShoppingIntent]) missingFields.push(field);
    });

    const featureCount = Object.values(intent.features || {}).filter(
      (v) => !!v,
    ).length;
    if (featureCount < 2) missingFields.push('more_product_details');

    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  }

  private async mapCategoryToUUID(
    categoryName: string,
  ): Promise<string | null> {
    try {
      if (!categoryName || typeof categoryName !== 'string') {
        return null;
      }

      // 🔹 Normalize input
      const input = categoryName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, ''); // remove special chars

      const normalizedInput = this.normalizeWord(input);
      const categories = await this.categoryService.getAllCategoriesAdmin();

      if (!categories || categories.length === 0) {
        return null;
      }

      let found = categories.find(
        (cat) => this.normalizeWord(cat.name.toLowerCase()) === normalizedInput,
      );

      if (found && isUUID(found.id)) {
        return found.id;
      }

      found = categories.find((cat) =>
        normalizedInput.includes(this.normalizeWord(cat.name.toLowerCase())),
      );

      if (found && isUUID(found.id)) {
        return found.id;
      }

      found = categories.find((cat) =>
        this.normalizeWord(cat.name.toLowerCase()).includes(normalizedInput),
      );

      if (found && isUUID(found.id)) {
        return found.id;
      }

      const synonymMap: Record<string, string[]> = {
        watches: ['watch', 'smartwatch', 'wrist watch'],
        electronics: ['laptop', 'macbook', 'device', 'computer'],
        'android phones': ['phone', 'mobile', 'smartphone'],
      };

      for (const [key, values] of Object.entries(synonymMap)) {
        if (values.some((v) => normalizedInput.includes(v))) {
          const match = categories.find(
            (cat) =>
              this.normalizeWord(cat.name.toLowerCase()) ===
              this.normalizeWord(key),
          );

          if (match && isUUID(match.id)) {
            return match.id;
          }
        }
      }

      let bestMatch: any = null;
      let highestScore = 0;

      for (const cat of categories) {
        const score = this.calculateSimilarity(
          normalizedInput,
          this.normalizeWord(cat.name.toLowerCase()),
        );

        if (score > highestScore) {
          highestScore = score;
          bestMatch = cat;
        }
      }

      // 🔹 Threshold to avoid wrong matches
      if (highestScore >= 0.6 && bestMatch && isUUID(bestMatch.id)) {
        return bestMatch.id;
      }

      return null;
    } catch (error) {
      // 🔹 Fail-safe (never break system)
      return null;
    }
  }

  private normalizeWord(word: string): string {
    if (!word) return '';

    // simple plural handling
    if (word.endsWith('s')) {
      return word.slice(0, -1);
    }

    return word;
  }

  private calculateSimilarity(s1: string, s2: string): number {
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix = Array.from({ length: len1 + 1 }, () =>
      Array(len2 + 1).fill(0),
    );

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Deletion
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j - 1] + cost, // Substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);

    // Similarity score 0 se 1 ke darmiyan
    return 1 - distance / maxLength;
  }
}

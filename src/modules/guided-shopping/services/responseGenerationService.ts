import { Injectable } from '@nestjs/common';
import {
  FinalChatResponseDto,
  RecommendationResponseDto,
  ClarificationResponseDto,
} from '../dto/response/guided-shoping-response.dto';
import { plainToInstance } from 'class-transformer';
import { ChatActionType } from '../enums/chatbot.enum';

@Injectable()
export class ResponseGenerationService {
  async generate(
    clarification?: ClarificationResponseDto,
    recommendations?: RecommendationResponseDto,
  ): Promise<FinalChatResponseDto> {
    if (clarification?.needsClarification) {
      return plainToInstance(FinalChatResponseDto, {
        message: clarification.question,
        actionType: ChatActionType.CLARIFICATION,
        suggestionPrompts: this.getSuggestions(clarification.missingAttribute),
      });
    }

    // Case 2: Zero Results
    if (recommendations && recommendations.totalMatches === 0) {
      return plainToInstance(FinalChatResponseDto, {
        message:
          'Maafi chahta hoon, aapke criteria ke mutabiq koi product nahi mila. Kya aap budget ya filters mein thori tabdeeli karna chahenge?',
        actionType: ChatActionType.GENERAL,
        suggestionPrompts: ['Budget barhaein', 'Search reset karein'],
      });
    }

    // Case 3: Successful Recommendations
    return plainToInstance(FinalChatResponseDto, {
      message: `Muje aapke liye ${recommendations?.totalMatches} behtreen products mile hain jo aapki pasand se mel khate hain!`,
      actionType: ChatActionType.RECOMMENDATION,
      recommendations: recommendations,
      suggestionPrompts: ['Show more like these', 'Compare prices'],
    });
  }

  private getSuggestions(attr?: string): string[] {
    const suggestions: Record<string, string[]> = {
      category: ['Watches', 'Electronics', 'Android Phones', 'Laptops'],
      budget: ['Under 5000', '5000 to 10000', 'Above 10000'],
      // Size aur Color mein 'Any' aur 'Skip' add kar diya gaya hai
      size: ['Small (S)', 'Medium (M)', 'Large (L)', 'Any Size', 'Skip'],
      color: [
        'Black',
        'White',
        'Navy Blue',
        'Crimson Red',
        'Any Color',
        'Skip',
      ],
      brand: ['Apple', 'Samsung', 'Sony', 'Infinix', 'Any Brand'],
    };

    if (!attr) return ['Help me find something', 'Latest Deals'];

    const map: Record<string, string> = {
      categoryId: 'category',
      budgetLimit: 'budget',
      color: 'color',
      size: 'size',
      preferredBrands: 'brand',
    };

    const key = map[attr] || attr.toLowerCase();
    let result = suggestions[key] || suggestions['category'];

    if ((key === 'color' || key === 'size') && !result.includes('Skip')) {
      result = [...result, 'Skip'];
    }

    return result;
  }
}

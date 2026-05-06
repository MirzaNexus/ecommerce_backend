import { SessionMetadata } from '../../enums/chatbot.enum';
import { Expose, Type } from 'class-transformer';
import { CreateShoppingIntentDto } from '../shopping-intent.dto';
import { CreateRecommendedProductDto } from '../recommendations-result.dto';
import { IsEnum } from 'class-validator';
import { ChatActionType } from '../../enums/chatbot.enum';

export class ChatSessionResponseDto {
  id!: string;
  status!: string;
  buyerId?: string;
  expiresAt!: Date;
  contextVersion!: number;
  metadata?: SessionMetadata;
}

export class MessageProcessResponseDto {
  isValid!: boolean;
  sanitizedContent!: string;
  length!: number;
}

export class AIIntegrationResponseDto {
  @Expose() rawResponse!: string;
  @Expose() parsedData!: any;
  @Expose() usage?: { promptTokens: number; completionTokens: number };
}

export class IntentExtractionResponseDto {
  @Expose() isComplete!: boolean;
  @Expose() missingFields!: string[];
  @Expose()
  @Type(() => CreateShoppingIntentDto)
  intent!: CreateShoppingIntentDto;
}

export class ClarificationResponseDto {
  @Expose() needsClarification!: boolean;
  @Expose() missingAttribute?: string;
  @Expose() question?: string;
}

export class RecommendationResponseDto {
  @Expose() sessionId!: string;
  @Expose()
  @Type(() => CreateRecommendedProductDto)
  products!: CreateRecommendedProductDto[];
  @Expose() totalMatches!: number;
}

export class FinalChatResponseDto {
  @Expose() message!: string;
  @Expose()
  @IsEnum(ChatActionType)
  actionType!: ChatActionType;

  @Expose()
  @Type(() => RecommendationResponseDto)
  recommendations?: RecommendationResponseDto;

  @Expose() suggestionPrompts?: string[];
}

export class PromptTemplateResponseDto {
  id!: string;
  type!: string;
  content!: string;
  version!: number;
  isActive!: boolean;
  updatedAt!: Date;
}

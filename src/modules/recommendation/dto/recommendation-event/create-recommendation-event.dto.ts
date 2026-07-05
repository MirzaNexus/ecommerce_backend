import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  IsObject,
} from 'class-validator';
import { RecommendationEventType } from '../../enum/recommendation-event-type.enum';
import { AlgoliaPayload } from '../../interface/algolia-payload.interface';

export class CreateRecommendationEventDto {
  @IsUUID('4', { message: 'user_id must be a valid UUID v4 format' })
  user_id!: string;

  @IsUUID('4', { message: 'product_id must be a valid UUID v4 format' })
  product_id!: string;

  @IsUUID('4', { message: 'category_id must be a valid UUID v4 format' })
  category_id!: string;

  @IsEnum(RecommendationEventType, {
    message: 'event_type must be either ADD_TO_CART or PAID_ORDER only',
  })
  event_type!: RecommendationEventType;

  @IsNumber({}, { message: 'price_at_event must be a valid number' })
  @Min(0, { message: 'price_at_event cannot be negative' })
  price_at_event!: number;

  @IsOptional()
  @IsString({ message: 'session_id must be a valid string' })
  session_id?: string;

  @IsUUID('4', {
    message: 'idempotency_key must be a valid UUID v4 format',
  })
  idempotency_key!: string;

  @IsOptional()
  @IsObject()
  algolia_payload?: Partial<AlgoliaPayload>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1;
}

// src/modules/guided-shopping/application/dto/chat-session.dto.ts
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { SessionStatus } from '../enums/chatbot.enum';
import { SessionMetadataDto } from './sub-dto/session-metadata.dto';

export class CreateChatSessionDto {
  @IsOptional()
  @IsUUID('4', { message: 'Buyer ID must be a valid UUID' })
  buyerId?: string;

  @IsOptional()
  @IsEnum(SessionStatus, { message: 'Invalid session status provided' })
  status?: SessionStatus;

  @IsOptional()
  @IsInt({ message: 'Context version must be an integer' })
  @Min(1, { message: 'Context version must start from at least 1' })
  contextVersion?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Expiration must be a valid ISO date string' })
  expiresAt?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => SessionMetadataDto)
  metadata?: SessionMetadataDto;
}

export class UpdateChatSessionDto extends PartialType(CreateChatSessionDto) {}

// src/modules/guided-shopping/application/dto/chat-message.dto.ts
import {
  IsUUID,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TokenUsageDto } from './sub-dto/token-usage.dto';
import { MessageRole } from '../enums/chatbot.enum';

export class CreateChatMessageDto {
  @IsUUID('4', { message: 'Session ID must be a valid UUID' })
  sessionId!: string;

  @IsEnum(MessageRole, {
    message: `Role must be one of: ${Object.values(MessageRole).join(', ')}`,
  })
  role!: MessageRole;

  @IsString({ message: 'Message content must be a string' })
  @IsNotEmpty({ message: 'Message content cannot be empty' })
  content!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Correlation ID must be a valid UUID' })
  correlationId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TokenUsageDto) // Hard alignment with Entity Interface
  tokenUsage?: TokenUsageDto;
}

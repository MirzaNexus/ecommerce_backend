// src/modules/guided-shopping/application/dto/prompt-template.dto.ts
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { TemplateType } from '../enums/chatbot.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePromptTemplateDto {
  @IsEnum(TemplateType, {
    message: `Template type must be one of: ${Object.values(TemplateType).join(', ')}`,
  })
  type!: TemplateType;

  @IsString({ message: 'Prompt content is required' })
  @IsNotEmpty({ message: 'Prompt content cannot be empty' })
  content!: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'Version must be an integer' })
  @Min(1)
  version?: number;
}

export class UpdatePromptTemplateDto extends PartialType(
  CreatePromptTemplateDto,
) {}

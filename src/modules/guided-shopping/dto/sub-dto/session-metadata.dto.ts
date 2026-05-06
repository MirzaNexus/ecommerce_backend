// src/modules/guided-shopping/application/dto/sub-dto/session-metadata.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';

import { DeviceType } from '../../enums/chatbot.enum';

export class SessionMetadataDto {
  @IsOptional()
  @IsEnum(DeviceType, {
    message: 'Device type must be MOBILE, DESKTOP, or TABLET',
  })
  deviceType?: DeviceType;

  @IsOptional()
  @IsString({ message: 'IP Address must be a valid string' })
  ipAddress?: string;

  @IsOptional()
  @IsString({ message: 'User agent must be a valid string' })
  userAgent?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is bot flag must be a boolean' })
  isBot?: boolean;

  @IsOptional()
  @IsString({ message: 'The initial landing page URL' })
  originUrl?: string;

  @IsOptional()
  @IsObject({ message: 'Additional flags must be an object' })
  customFlags?: Record<string, any>;
}

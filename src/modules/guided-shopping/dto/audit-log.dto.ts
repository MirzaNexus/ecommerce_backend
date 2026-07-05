import { IsUUID, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditDataDto } from './sub-dto/AuditDataDto';

export class CreateChatbotAuditLogDto {
  @IsUUID('4')
  adminId!: string;

  @IsUUID('4')
  entityId!: string;

  @IsString()
  action!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AuditDataDto)
  oldValue?: AuditDataDto;

  @ValidateNested()
  @Type(() => AuditDataDto)
  newValue!: AuditDataDto;
}

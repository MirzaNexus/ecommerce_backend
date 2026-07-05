import { IsUUID, IsObject, IsOptional, IsNumber } from 'class-validator';

export class AuditDataDto {
  @IsUUID('4', { message: 'Entity ID must be a valid UUID' })
  entityId!: string;

  @IsObject({ message: 'Fields must be a valid key-value mapping' })
  fields!: Record<string, any>;

  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

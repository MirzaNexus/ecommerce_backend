import { IsNumber, Min } from 'class-validator';

export class TokenUsageDto {
  @IsNumber()
  @Min(0)
  promptTokens!: number;

  @IsNumber()
  @Min(0)
  completionTokens!: number;

  @IsNumber()
  @Min(0)
  totalTokens!: number;
}

import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserOrdersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit: number = 10;
}

// user-order-res.dto.ts (Response Item)
export class UserOrderResDto {
  id!: string;
  totalAmount!: number;
  status!: string;
  createdAt!: Date;
  itemCount!: number; // Sirf count dikhana kafi hai list mein
  firstItemName!: string; // List mein "Product A + 2 more" dikhane ke liye
}

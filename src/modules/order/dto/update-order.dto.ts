import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderDto {
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  @IsOptional()
  status?: OrderStatus;
}

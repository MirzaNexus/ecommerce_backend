import { IsUUID, IsEnum, IsString, IsNotEmpty } from 'class-validator';

import { PaymentStatus } from '../../enums/payment-status.enum';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'Order ID must be a valid UUID' })
  orderId!: string;

  @IsString({ message: 'Transaction ID must be a string' })
  @IsNotEmpty({ message: 'Transaction ID is required' })
  transactionId!: string;

  @IsEnum(PaymentStatus, {
    message: 'Invalid payment status value',
  })
  status!: PaymentStatus;

  @IsString({ message: 'Payment provider must be a string' })
  @IsNotEmpty({ message: 'Payment provider is required' })
  provider!: string;
}

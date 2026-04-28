import { Controller, Post, Request, Body, Req } from '@nestjs/common';
import { Headers } from '@nestjs/common';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment-service/payment-service.service';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/user/entities/user.entity';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { UseGuards } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @Post('session')
  async createSession(@Request() req, @Body('orderId') orderId: string) {
    return await this.paymentService.createCheckoutSession(
      orderId,
      req.user.id,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: any, // RawRequest type use karein agar available ho
  ) {
    return await this.paymentService.handleStripeWebhook(sig, req.rawBody);
  }
}

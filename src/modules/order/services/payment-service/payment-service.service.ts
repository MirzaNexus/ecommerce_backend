import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import * as StripeNamespace from 'stripe';

import { OrderRepository } from '../../repos/orderRepository';
import { PaymentRepository } from '../../repos/paymentRepository';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

@Injectable()
export class PaymentService {
  private readonly stripe: StripeNamespace.Stripe;

  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepo: OrderRepository,
    private readonly paymentRepo: PaymentRepository,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new StripeNamespace.Stripe(stripeKey, {
      apiVersion: '2023-10-16' as any,
    });
  }

  /**
   * ✅ CREATE PAYMENT SESSION
   */
  async createCheckoutSession(orderId: string, userId: string) {
    // Repository se order fetch karein (Ownership check ke sath)
    const order = await this.orderRepo.findById(orderId, userId);

    if (!order) {
      throw new NotFoundException('Order not found or access denied');
    }

    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        `Order is in ${order.status} state, payment not allowed`,
      );
    }

    // Check if order already has a completed payment
    const existingPayments = await this.paymentRepo.findByOrderId(order.id);
    if (existingPayments?.some((p) => p.status === PaymentStatus.COMPLETED)) {
      throw new ConflictException('Order already paid');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: order.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName,
            metadata: { variantId: item.productVariantId },
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID&orderId=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
      metadata: { orderId: order.id },
    });

    if (!session.url) {
      throw new InternalServerErrorException('Failed to create Stripe session');
    }

    // Save initial payment record
    await this.paymentRepo.createPayment({
      order: order,
      transactionId: session.id,
      provider: 'STRIPE',
      status: PaymentStatus.PENDING,
      amount: order.totalAmount,
      currency: 'usd',
    });

    return { url: session.url };
  }
  /**
   * ✅ HANDLE STRIPE WEBHOOK
   */
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET missing');

    let event: StripeNamespace.Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data
        .object as StripeNamespace.Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await this.processPaymentSuccess(
          orderId,
          session.payment_intent as string,
          session,
        );
      }
    }

    return { received: true };
  }

  /**
   * ✅ PROCESS PAYMENT SUCCESS
   */
  private async processPaymentSuccess(
    orderId: string,
    transactionId: string,
    gatewayResponse: any,
  ) {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // Row locking for safety
      const order = await this.orderRepo.findOneWithLock(orderId, manager);
      if (!order || order.status === OrderStatus.PAID) return;

      // Update Order
      await this.orderRepo.updateStatus(order.id, OrderStatus.PAID, manager);

      // Update Payment
      const payment = await this.paymentRepo.findByTransactionId(
        gatewayResponse.id,
        manager,
      );
      if (payment) {
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionId = transactionId;
        payment.gatewayResponse = gatewayResponse;
        await manager.save(payment);
      }
    });
  }
}

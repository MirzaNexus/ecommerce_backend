import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<Payment> {
    return (manager ?? this.manager).getRepository(Payment);
  }

  async findByOrderId(
    orderId: string,
    manager?: EntityManager,
  ): Promise<Payment[]> {
    return await this.repo(manager).find({
      where: { order: { id: orderId } }, // Relation based query
    });
  }
  async createPayment(
    paymentData: Partial<Payment>,
    manager?: EntityManager,
  ): Promise<Payment> {
    const payment = this.repo(manager).create(paymentData);
    return await this.repo(manager).save(payment);
  }

  async findByTransactionId(
    transactionId: string,
    manager?: EntityManager,
  ): Promise<Payment | null> {
    return await this.repo(manager).findOne({ where: { transactionId } });
  }

  async findByIdempotencyKey(
    key: string,
    manager?: EntityManager,
  ): Promise<Payment | null> {
    return await this.repo(manager).findOne({ where: { idempotencyKey: key } });
  }
}

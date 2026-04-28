import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Injectable()
export class OrderRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<Order> {
    return (manager ?? this.manager).getRepository(Order);
  }

  async createOrder(
    orderData: Partial<Order>,
    manager?: EntityManager,
  ): Promise<Order> {
    const order = this.repo(manager).create(orderData);
    return await this.repo(manager).save(order);
  }

  async findById(
    id: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<Order | null> {
    return await this.repo(manager).findOne({
      where: { id, userId },
      relations: ['items', 'user'],
    });
  }

  async findUserOrders(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[Order[], number]> {
    const skip = (page - 1) * limit;

    return await this.repo().findAndCount({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' }, // Latest order hamesha top par
      take: limit,
      skip: skip,
    });
  }

  async findOneWithLock(
    id: string,
    manager: EntityManager,
  ): Promise<Order | null> {
    return await manager
      .getRepository(Order)
      .createQueryBuilder('order')
      .setLock('pessimistic_write')
      .where('order.id = :id', { id })
      .getOne();
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update(id, { status });
  }

  async findByIdempotencyKey(
    key: string,
    manager?: EntityManager,
  ): Promise<Order | null> {
    return await this.repo(manager).findOne({
      where: { idempotencyKey: key },
      relations: ['items'], // Relations load karna behtar hai taake duplicate response complete ho
    });
  }

  async findAllPaginated(
    filters: { status?: OrderStatus },
    skip: number,
    limit: number,
    manager?: EntityManager,
  ): Promise<{ data: Order[]; total: number }> {
    const query = this.repo(manager)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user') // Optional: add if admin needs user details
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
}

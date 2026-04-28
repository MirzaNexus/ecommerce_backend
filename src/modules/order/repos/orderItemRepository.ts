import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<OrderItem> {
    return (manager ?? this.manager).getRepository(OrderItem);
  }

  async bulkCreate(
    items: Partial<OrderItem>[],
    manager: EntityManager,
  ): Promise<OrderItem[]> {
    const instances = this.repo(manager).create(items);
    return await this.repo(manager).save(instances);
  }
}

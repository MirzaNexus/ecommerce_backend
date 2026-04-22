import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { VariantService } from 'src/modules/products/services/variant/variants.service';
import { OrderRepository } from '../repos/orderRepository';
import { OrderItemRepository } from '../repos/orderItemRepository';
import { PaymentRepository } from '../repos/paymentRepository';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { AddressSnapshot } from '../entities/order.entity';
import { AddressTsService } from 'src/modules/user/services/address/user-address.service';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { InventoryService } from 'src/modules/products/services/inventory/inventory.service';
import { GetUserOrdersQueryDto } from '../dto/buyers-orders-query.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepo: OrderRepository,
    private readonly itemRepo: OrderItemRepository,
    private readonly variantService: VariantService,
    private readonly paymentRepo: PaymentRepository,
    private readonly addressService: AddressTsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async checkout(userId: string, dto: CreateOrderDto): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Idempotency Check
      if (dto.idempotencyKey) {
        const existing = await this.orderRepo.findByIdempotencyKey(
          dto.idempotencyKey,
          manager,
        );
        if (existing) return existing;
      }

      // 2. Fetch Variants (Source of Truth)
      const variantIds = dto.items.map((i) => i.productVariantId);
      const variants = await this.variantService.getVariantsForCheckout(
        variantIds,
        manager,
      );

      if (variants.length !== variantIds.length) {
        throw new BadRequestException('One or more products are unavailable.');
      }

      let totalAmount = 0;
      const orderItemsData: Partial<OrderItem>[] = [];

      // 3. Validation & Snapshotting Loop
      for (const itemDto of dto.items) {
        const variant = variants.find((v) => v.id === itemDto.productVariantId);
        if (!variant) {
          throw new NotFoundException(
            `Product with ID ${itemDto.productVariantId} not found`,
          );
        }
        if (!variant.inventory || variant.inventory.stock < itemDto.quantity) {
          throw new ConflictException(
            `Insufficient stock for ${variant.product?.name || 'this product'}`,
          );
        }

        // Price Calculation (Backend Override)
        const priceAtCheckout = Number(variant.price);
        totalAmount += priceAtCheckout * itemDto.quantity;

        // Prepare Item Snapshot
        orderItemsData.push({
          productVariantId: variant.id,
          productName: variant.product.name,
          productImage: variant.imageUrl,
          price: priceAtCheckout,
          quantity: itemDto.quantity,
          variantData: { sku: variant.sku, attributes: variant.attributes },
        });

        // 4. Decrement Stock (Atomic)
        await this.inventoryService.decreaseStock(
          variant.id,
          itemDto.quantity,
          manager,
        );
      }

      // OrderService.ts ke andar

      let finalAddress: AddressSnapshot;

      if (dto.userAddressId) {
        // 1. Database se address fetch karein
        const addressEntity = await this.addressService.getAddressForOrder(
          dto.userAddressId,
          userId,
          manager,
        );

        // 2. Map Entity to Snapshot (Data freezing)
        finalAddress = {
          fullName: addressEntity.user.fullName,
          phone: addressEntity.user.phone as any,
          line1: addressEntity.line1,
          line2: addressEntity.line2,
          city: addressEntity.city,
          state: addressEntity.state,
          postalCode: addressEntity.postalCode,
          country: addressEntity.country,
        };
      } else if (dto.addressSnapshot) {
        finalAddress = dto.addressSnapshot;
      } else {
        throw new BadRequestException('Please provide a delivery address.');
      }

      // 6. Create Order
      const order = await this.orderRepo.createOrder(
        {
          userId,
          status: OrderStatus.AWAITING_PAYMENT,
          totalAmount,
          addressSnapshot: finalAddress,
          idempotencyKey: dto.idempotencyKey,
        },
        manager,
      );

      // 7. Save Items
      const itemsToSave = orderItemsData.map((item) => ({
        ...item,
        order: order,
      }));

      await this.itemRepo.bulkCreate(itemsToSave, manager);
      const finalOrder = await this.orderRepo.findById(
        order.id,
        userId,
        manager,
      );

      if (!finalOrder)
        throw new InternalServerErrorException(
          'Order creation failed unexpectedly',
        );

      return finalOrder;
    });
  }

  private validateStateTransition(
    current: OrderStatus,
    next: OrderStatus,
  ): void {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.CREATED]: [
        OrderStatus.AWAITING_PAYMENT,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.AWAITING_PAYMENT]: [
        OrderStatus.PAID,
        OrderStatus.FAILED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PAID]: [OrderStatus.CANCELLED], // Admin only usually
      [OrderStatus.FAILED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowed[current]?.includes(next)) {
      throw new ForbiddenException(
        `Cannot transition from ${current} to ${next}`,
      );
    }
  }

  async cancelOrder(orderId: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepo.findOneWithLock(orderId, manager);

      if (!order || order.userId !== userId)
        throw new NotFoundException('Order not found');

      // Strict State Guard: Only cancel if not yet processed/paid
      const cancellableStates = [
        OrderStatus.CREATED,
        OrderStatus.AWAITING_PAYMENT,
      ];
      if (!cancellableStates.includes(order.status)) {
        throw new BadRequestException(
          'Order cannot be cancelled at this stage',
        );
      }

      await this.orderRepo.updateStatus(
        order.id,
        OrderStatus.CANCELLED,
        manager,
      );

      // Logic to restore stock if necessary
      for (const item of order.items) {
        await this.inventoryService.increaseStock(
          item.productVariantId,
          item.quantity,
          manager,
        );
      }
    });
  }

  async getOrderDetails(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId, userId);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // order.service.ts
  async getMyOrders(userId: string, query: GetUserOrdersQueryDto) {
    const { page, limit } = query;
    const [orders, total] = await this.orderRepo.findUserOrders(
      userId,
      page,
      limit,
    );

    return {
      items: orders.map((order) => ({
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        firstItemName: order.items[0]?.productName || 'Order',
      })),
      meta: {
        totalItems: total,
        itemCount: orders.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  // Admin methods like getAdminOrders, updateStatus can be implemented similarly with appropriate guards and logic

  async getAdminOrders(
    status?: OrderStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // 1. Fetch raw data and total count from Repository
    const { data, total } = await this.orderRepo.findAllPaginated(
      { status },
      skip,
      limit,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: data,
      meta: {
        total: total,
        page: Number(page),
        limit: Number(limit),
        totalPages: totalPages,
      },
    };
  }

  async adminUpdateStatus(id: string, nextStatus: OrderStatus): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepo.findOneWithLock(id, manager);
      if (!order) throw new NotFoundException('Order not found');

      // Centralized State Transition Guard call
      this.validateStateTransition(order.status, nextStatus);

      await this.orderRepo.updateStatus(id, nextStatus, manager);
    });
  }

  async getPaymentByTxId(transactionId: string) {
    const payment = await this.paymentRepo.findByTransactionId(transactionId);
    if (!payment) throw new NotFoundException('Transaction not found');
    return payment;
  }
}

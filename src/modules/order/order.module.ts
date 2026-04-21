import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from '../order/repos/orderRepository';
import { OrderItemRepository } from '../order/repos/orderItemRepository';
import { PaymentRepository } from '../order/repos/paymentRepository';
import { Inventory } from '../products/entities/inventory.entity';
import { Variant } from '../products/entities/variant.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { ProductsModule } from '../products/products.module';
import { forwardRef } from '@nestjs/common';
import { PaymentService } from './services/payment-service/payment-service.service';
import { PaymentController } from './controllers/payment/payment.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Variant, Payment, Product]),
    forwardRef(() => ProductsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [OrderController, PaymentController],
  providers: [
    OrderService,
    OrderItemRepository,
    OrderRepository,
    PaymentRepository,
    PaymentService,
  ],
})
export class OrderModule {}

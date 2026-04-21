import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { OrderService } from '../services/order.service';
import { UserRole } from 'src/modules/user/entities/user.entity';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { OrderStatus } from '../enums/order-status.enum';
import { UpdateOrderDto } from '../dto/update-order.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUYER, UserRole.ADMIN)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @Roles(UserRole.BUYER, UserRole.ADMIN) // Admins can also checkout on behalf of buyers
  async checkout(@Request() req: any, @Body() dto: CreateOrderDto) {
    // req.user.id is extracted from your JWT/Auth Guard
    return await this.orderService.checkout(req.user.id, dto);
  }

  @Get(':id')
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  async getOrder(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return await this.orderService.getOrderDetails(id, req.user.id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  async cancelOrder(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.orderService.cancelOrder(id, req.user.id);
  }

  //Admin Endpoints can be added here with appropriate guards and roles

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.orderService.getAdminOrders(status, page, limit);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return await this.orderService.adminUpdateStatus(id, dto.status!);
  }

  @Get('payments/:transactionId')
  @Roles(UserRole.ADMIN)
  async getPaymentDetails(@Param('transactionId') txId: string) {
    return await this.orderService.getPaymentByTxId(txId);
  }
}

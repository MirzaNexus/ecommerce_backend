import {
  Controller,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { InventoryService } from '../../services/inventory/inventory.service';
import { CreateInventoryDto } from '../../dto/inventory/create-inventory.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/user/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateInventoryDto) {
    return this.service.createInventory(dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateStock(@Body() dto: CreateInventoryDto) {
    return this.service.updateStock(dto.variantId, dto.stock);
  }
}

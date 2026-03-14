import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AddressTsService } from '../../services/address/user-address.service';
import { CreateAddressDto } from '../../dto/create-user-address.dto';
import { UpdateAddressDto } from '../../dto/update-user-address.dto';

@Controller('users/me/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressTsService) {}

  @Post()
  async createAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    const userId = req.user?.id;

    return this.addressService.createAddress(userId, dto);
  }

  @Patch(':id')
  async updateAddress(
    @Req() req: any,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const userId = req.user?.id;

    return this.addressService.updateAddress(userId, addressId, dto);
  }

  @Delete(':id')
  async deleteAddress(@Req() req: any, @Param('id') addressId: string) {
    const userId = req.user?.id;

    return this.addressService.deleteAddress(userId, addressId);
  }

  @Get()
  async listAddresses(@Req() req: any) {
    const userId = req.user?.id;

    return this.addressService.listAddresses(userId);
  }

  @Patch(':id/default')
  async setDefaultAddress(@Req() req: any, @Param('id') addressId: string) {
    const userId = req.user?.id;

    return this.addressService.setDefaultAddress(userId, addressId);
  }
}

// POST   /users/me/addresses
// GET    /users/me/addresses
// PATCH  /users/me/addresses/:id
// PATCH  /users/me/addresses/:id/default
// DELETE /users/me/addresses/:id

//💡 Senior Backend Insight
//Large production APIs (e.g., in systems like Stripe or Shopify) usually follow these rules:
// Authenticated user resources → /me
// Nested resources → /users/me/addresses
// Actions → /resource/:id/action

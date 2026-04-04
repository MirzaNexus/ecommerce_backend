import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from '../../repositories/AddressRepository';
import { DataSource } from 'typeorm';
import { UserAddress } from '../../entities/user-address.entity';
import { CreateAddressDto } from '../../dto/create-user-address.dto';
import { UpdateAddressDto } from '../../dto/update-user-address.dto';
@Injectable()
export class AddressTsService {
  constructor(
    private addressRepo: AddressRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createAddress(userId: string, dto: CreateAddressDto) {
    return this.dataSource.transaction(async (manager) => {
      if (dto.isDefault) {
        await this.addressRepo.resetDefault(userId, manager);
      }

      return await this.addressRepo.create(
        {
          ...dto,
          userId,
        },
        manager,
      );
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await this.addressRepo.findByUserId(userId, manager);
      const address = existing.find((a) => a.id === addressId);
      if (!address) {
        throw new NotFoundException('Address not found');
      }
      if (dto.isDefault) {
        await this.addressRepo.resetDefault(userId, manager);
      }

      return await this.addressRepo.update(addressId, dto, manager);
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await this.addressRepo.findByUserId(userId, manager);
      const address = existing.find((a) => a.id === addressId);
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      await this.addressRepo.delete(addressId, manager);
    });
  }

  async listAddresses(userId: string) {
    return await this.addressRepo.findByUserId(userId);
  }

  async setDefaultAddress(userId: string, addressId: string) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await this.addressRepo.findByUserId(userId, manager);
      const address = existing.find((a) => a.id === addressId);
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      await this.addressRepo.resetDefault(userId, manager);
      await this.addressRepo.setDefault(addressId, manager);
      return await this.addressRepo.update(addressId, {}, manager);
    });
  }
}

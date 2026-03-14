import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { AdminUsersController } from './controllers/admin/admin-user.controller';
import { AddressController } from './controllers/address/user-address.controller';
import { AddressTsService } from './services/address/user-address.service';
import { AdminUserService } from './services/admin/admin-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Credential } from '../auth/entities/credential.entity';
import { UserAddress } from './entities/user-address.entity';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import { AddressRepository } from './repositories/AddressRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credential, UserAddress]),
    AuthModule,
  ],
  controllers: [UserController, AdminUsersController, AddressController],
  providers: [
    UserService,
    UserRepository,
    AddressRepository,
    AddressTsService,
    AdminUserService,
  ],
})
export class UserModule {}

import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminUserService } from '../../services/admin/admin-user.service';
import { UpdateUserStatusDto } from '../../dto/UpdateUserStatusDto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private adminUserService: AdminUserService) {}

  @Get()
  getUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminUserService.getUsers(page, limit, status);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.adminUserService.getUserById(id);
  }

  @Patch(':id/status')
  updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUserService.updateUserStatus(userId, dto);
  }
}

/*
Method	Route	Purpose
GET	/admin/users	List users (pagination)
GET	/admin/users/:id	Get user + addresses
PATCH	/admin/users/:id/status	Update user status
*/

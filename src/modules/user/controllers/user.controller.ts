import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { RegisterBuyerDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerBuyer(@Body() dto: RegisterBuyerDto) {
    return this.userService.registerBuyer(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Buyer')
  async getProfile(@Req() req) {
    const userId = req.user?.id;
    return this.userService.getMyProfile(userId);
  }
  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Buyer')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user?.id;
    return this.userService.updateProfile(userId, dto);
  }
}

// POST   /users/register
// GET    /users/me
// PATCH  /users/me

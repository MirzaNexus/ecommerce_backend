import { Body, Controller, Post, Get, Req, Patch } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { RegisterBuyerDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-user.dto';

@Controller('use')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerBuyer(@Body() dto: RegisterBuyerDto) {
    return this.userService.registerBuyer(dto);
  }

  @Get('me')
  async getProfile(@Req() req) {
    const userId = req.user?.id;
    return this.userService.getMyProfile(userId);
  }
  @Patch('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user?.id;
    return this.userService.updateProfile(userId, dto);
  }
}

// POST   /users/register
// GET    /users/me
// PATCH  /users/me

import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { CreateVariantDto } from '../../dto/variant/create-variant.dto';
import { VariantService } from '../../services/variant/variants.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/user/entities/user.entity';
import { UpdateVariantDto } from '../../dto/variant/update-variant.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/variants')
export class VariantController {
  constructor(private readonly service: VariantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateVariantDto,
  ) {
    return this.service.createVariant(dto, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.service.updateVariant(id, dto, file);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.deleteVariant(id);
  }
}

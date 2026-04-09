import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from '../../services/category/category.service';
import { CreateCategoryDto } from '../../dto/category/create-category.dto';
import { UpdateCategoryDto } from '../../dto/category/update-category.dto';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/user/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategoriesAdmin();
  }

  @Get('tree')
  async getCategoryTree() {
    return this.categoryService.getAllCategoriesAdminNested();
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}

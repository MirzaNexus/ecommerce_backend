import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductIdParamDto } from '../dto/getAllProductsQueryDto';
import { GetAllProductsQueryDto } from '../dto/getAllProductsQueryDto';

// import { AuthGuard } from 'src/common/guards/auth.guard';
// import { RolesGuard } from 'src/common/guards/roles.guard';
// import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin/products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  // 🔐 Apply later in production
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('ADMIN')

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto) {
    return this.service.createProduct(dto);
  }

  @Get()
  async getAll(@Query() query: GetAllProductsQueryDto) {
    return this.service.getAllProductsAdmin(query);
  }

  @Get(':id')
  async getOne(@Param('id') params: ProductIdParamDto) {
    return this.service.getProductById(params.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.deleteProduct(id);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Patch(':id/archive')
  async archiveProduct(@Param('id') id: string) {
    return this.service.archiveProduct(id);
  }
}

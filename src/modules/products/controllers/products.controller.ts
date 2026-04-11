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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductIdParamDto } from '../dto/getAllProductsQueryDto';
import { GetAllProductsQueryDto } from '../dto/getAllProductsQueryDto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/user/entities/user.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetBuyerProductsQueryDto } from '../dto/getBuyerProductQueryDto';
import { PaginatedBuyerProductsDto } from '../dto/buyerProductResponseDto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'variantImages', maxCount: 10 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      variantImages?: Express.Multer.File[];
    },
    @Body() dto: CreateProductDto,
  ) {
    return this.service.createProduct(
      dto,
      files.mainImage?.[0],
      files.variantImages,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async getAll(@Query() query: GetAllProductsQueryDto) {
    return this.service.getAllProductsAdmin(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BUYER)
  async getOne(@Param('id') params: ProductIdParamDto) {
    return this.service.getProductById(params.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(id, dto, file);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.service.deleteProduct(id);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN)
  async toggle(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Patch(':id/archive')
  @Roles(UserRole.ADMIN)
  async archiveProduct(@Param('id') id: string) {
    return this.service.archiveProduct(id);
  }

  @Get('buyer/list')
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  async getBuyerProducts(
    @Query() query: GetBuyerProductsQueryDto,
  ): Promise<PaginatedBuyerProductsDto> {
    return await this.service.getAllProductsBuyer(query);
  }
}

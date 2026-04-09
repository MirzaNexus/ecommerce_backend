import { Module } from '@nestjs/common';
import { CategoryController } from './controllers/category/category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './services/category/category.service';
import { ProductController } from './controllers/products.controller';
import { ProductService } from './services/products.service';
import { Category } from './entities/category.entity';
import { Variant } from './entities/variant.entity';
import { Inventory } from './entities/inventory.entity';
import { Product } from './entities/product.entity';
import { CategoryRepository } from './repositories/category.repository';
import { ProductRepository } from './repositories/product.repositry';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Variant, Inventory])],

  controllers: [ProductController, CategoryController],
  providers: [
    ProductService,
    CategoryService,
    CategoryRepository,
    ProductRepository,
  ],
})
export class ProductsModule {}

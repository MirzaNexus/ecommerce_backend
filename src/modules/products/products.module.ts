import { Module } from '@nestjs/common';
import { CategoryController } from './controllers/category/category.controller';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './services/category/category.service';
import { ProductsService } from './services/products.service';
import { Category } from './entities/category.entity';
import { Variant } from './entities/variant.entity';
import { Inventory } from './entities/inventory.entity';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Variant, Inventory])],

  controllers: [ProductsController, CategoryController],
  providers: [ProductsService, CategoryService],
})
export class ProductsModule {}

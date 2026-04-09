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
import { VariantsService } from './services/variant/variants.service';
import { InventoryService } from './services/inventory/inventory.service';
import { InventoryController } from './controllers/inventory/inventory.controller';
import { InventoryRepository } from './repositories/inventory.repository';
import { VariantRepository } from './repositories/variant.repository';
import { VariantController } from './controllers/variant/variant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Variant, Inventory])],

  controllers: [
    ProductController,
    CategoryController,
    InventoryController,
    VariantController,
  ],
  providers: [
    ProductService,
    CategoryService,
    CategoryRepository,
    ProductRepository,
    VariantRepository,
    InventoryRepository,
    VariantsService,
    InventoryService,
  ],
})
export class ProductsModule {}

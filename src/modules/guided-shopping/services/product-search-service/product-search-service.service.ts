import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/modules/products/services/products.service';
import { CreateShoppingIntentDto } from '../../dto/shopping-intent.dto';
import { Product } from 'src/modules/products/entities/product.entity';

@Injectable()
export class ProductSearchService {
  constructor(private readonly catalogProductService: ProductService) {}

  async searchByIntent(intent: CreateShoppingIntentDto): Promise<Product[]> {
    return await this.catalogProductService.getProductsByIntent(intent);
  }
}

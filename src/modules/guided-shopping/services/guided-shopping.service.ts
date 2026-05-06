import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/modules/products/services/products.service';
import { GeminiIntegrationService } from './gemini-integration/gemini-integration.service';

@Injectable()
export class GuidedShoppingService {
  constructor(
    private readonly productService: ProductService,
    private readonly geminiService: GeminiIntegrationService,
  ) {}

  async handleProductInquiry(identifier: string, userRawMessage: string) {
    const product = await this.productService.getInquiryData(identifier);

    if (!product) {
      return {
        message:
          'Maafi chahta hoon, mujhe is product ki details nahi mil sakti. Kya aapne SKU sahi enter kiya hai?',
        actionType: 'GENERAL',
      };
    }

    // 1. Check if specific Variant SKU was asked
    const matchedVariant = product.variants.find(
      (v) => v.sku.toLowerCase() === identifier.toLowerCase(),
    );

    // 2. Map Inventory & Stock Data
    const inventoryInfo = product.variants.map((v) => ({
      sku: v.sku,
      color: v.attributes?.color || 'N/A',
      size: v.attributes?.size || 'N/A',
      price: v.price,
      stock: v.inventory?.stock || 0,
    }));

    const totalStock = inventoryInfo.reduce((acc, curr) => acc + curr.stock, 0);

    // 3. Generate AI Explanation if purpose is asked
    const needsExplanation =
      /(kis liye|faida|purpose|use|how to|what is)/i.test(userRawMessage);
    let aiExplanation = '';
    if (needsExplanation) {
      aiExplanation = await this.geminiService.explainProduct(
        userRawMessage,
        product,
      );
    }

    // 4. Construct Professional Response
    let responseMessage = aiExplanation ? `${aiExplanation}\n\n` : '';

    if (matchedVariant) {
      const stockStatus =
        matchedVariant.inventory?.stock > 0
          ? `✅ In Stock (${matchedVariant.inventory.stock} available)`
          : `❌ Out of Stock`;

      responseMessage += `*Specific Variant Details:*
      - SKU: ${matchedVariant.sku}
      - Price: Rs. ${matchedVariant.price}
      - Attributes: ${matchedVariant.attributes?.color}, ${matchedVariant.attributes?.size}
      - Status: ${stockStatus}`;
    } else {
      const availableVariants = inventoryInfo
        .filter((v) => v.stock > 0)
        .map((v) => `${v.color}/${v.size} (Rs. ${v.price})`)
        .join(', ');

      responseMessage += `*Product Overview:*
      - Name: ${product.name}
      - Base Price: Rs. ${product.basePrice || 'N/A'}
      - Total Stock: ${totalStock} units
      - Available Options: ${availableVariants || 'None currently available'}`;
    }

    return {
      message: responseMessage,
      actionType: 'PRODUCT_DETAILS',
      metadata: {
        productId: product.id,
        isAvailable: totalStock > 0,
        category: product.category?.name,
      },
    };
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as CacheManager from 'cache-manager';

// Services Imports
import { ChatSessionService } from './chat-session/chat-session.service';
import { MessageProcessorService } from './chat-message/chat-message.service';
import { GeminiIntegrationService } from './gemini-integration/gemini-integration.service';
import { IntentExtractionService } from './intent-extraction/intent-extraction.service';
import { ClarificationEngineService } from './clarification-engine/clarification-engine.service';
import { ProductSearchService } from './product-search-service/product-search-service.service';
import { RecommendationOrchestratorService } from './recommendation-orchestrator/recommendation-orchestrator.service';
import { ResponseGenerationService } from './responseGenerationService';
import { ChatHistoryService } from './chat-history.service';
import { ChatbotAnalyticsService } from './chatbot-analytics/chatbot-analytics.service';
import { PromptManagementService } from './prompt-management/prompt-management.service';
import { GuidedShoppingService } from './guided-shopping.service';

// DTOs & Enums
import { CreateChatMessageDto } from '../dto/chat-message.dto';
import { FinalChatResponseDto } from '../dto/response/guided-shoping-response.dto';
import { MessageRole, TemplateType } from '../enums/chatbot.enum';
import { plainToInstance } from 'class-transformer';
import { ChatActionType } from '../enums/chatbot.enum';

@Injectable()
export class GuidedShoppingOrchestrator {
  private readonly logger = new Logger(GuidedShoppingOrchestrator.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager.Cache,
    private readonly sessionService: ChatSessionService,
    private readonly processor: MessageProcessorService,
    private readonly gemini: GeminiIntegrationService,
    private readonly intentService: IntentExtractionService,
    private readonly clarification: ClarificationEngineService,
    private readonly searchService: ProductSearchService,
    private readonly recOrchestrator: RecommendationOrchestratorService,
    private readonly responseGen: ResponseGenerationService,
    private readonly chatHistoryService: ChatHistoryService,
    private readonly analytics: ChatbotAnalyticsService,
    private readonly promptService: PromptManagementService,
    private readonly guidedShoppingService: GuidedShoppingService,
  ) {}

  async handleUserMessage(
    dto: CreateChatMessageDto,
    buyerId?: string,
  ): Promise<FinalChatResponseDto> {
    const activePromptTemplate = await this.promptService.getActivePrompt(
      TemplateType.SYSTEM_PROMPT,
    );

    try {
      const cacheKey = `chat_resp_${dto.sessionId}_${dto.content.trim().toLowerCase()}`;

      const cachedResponse =
        await this.cacheManager.get<FinalChatResponseDto>(cacheKey);

      if (cachedResponse) {
        this.logger.log(`Serving cached response`);
        return cachedResponse;
      }

      // Save user message
      await this.chatHistoryService.recordMessage(
        dto.sessionId,
        dto.content,
        MessageRole.USER,
      );

      // Validate session
      await this.sessionService.resumeSession(dto.sessionId);
      if (buyerId) {
        await this.sessionService.validateOwnership(dto.sessionId, buyerId);
      }

      // Process message
      const processed = await this.processor.processIncoming(dto);

      const currentIntent = await this.intentService.getCurrentIntent(
        dto.sessionId,
      );

      // existing session data se context nikalen
      const lastProduct =
        currentIntent?.session?.metadata?.customFlags?.lastViewedProductName;

      const contextForAI = {
        category: currentIntent?.category?.name || null,
        budgetLimit: currentIntent?.budgetLimit || null, // Key name updated to match DTO
        productIdentifier: lastProduct || null, // 'lastViewed' ko 'productIdentifier' banaya
        brand: currentIntent?.features?.brand || null,
      };

      const isAskingDetails =
        /(detail|spec|iski|isky|batao|features|khusosiyat)/i.test(dto.content);
      const shouldUseAI =
        !currentIntent?.categoryId ||
        !currentIntent?.budgetLimit ||
        isAskingDetails;

      let parsedData: any;

      if (shouldUseAI) {
        try {
          const aiResponse = await this.gemini.generateCompletion(
            processed.sanitizedContent,
            dto.sessionId,
            contextForAI,
          );
          parsedData = aiResponse.parsedData;
        } catch (error) {
          this.logger.warn('Gemini failed → using fallback parser');
          parsedData = this.fallbackIntentParser(
            processed.sanitizedContent,
            lastProduct,
          );
        }
      } else {
        parsedData = this.fallbackIntentParser(processed.sanitizedContent);
      }

      if (
        parsedData.intent === 'PRODUCT_INQUIRY' ||
        parsedData.productIdentifier
      ) {
        // Direct IntentService ke specialized method ko call karein
        const inquiryResult =
          await this.guidedShoppingService.handleProductInquiry(
            parsedData.productIdentifier,
            dto.content,
          );

        // Final Response format mein convert karke return kar dein
        const finalResponse = plainToInstance(FinalChatResponseDto, {
          message: inquiryResult.message,
          actionType: inquiryResult.actionType,
          metadata: inquiryResult.metadata,
          recommendations: null, // Specific inquiry mein search recommendations ki zaroorat nahi
        });

        // Save history & Return (Taki aage ka filtration flow na chale)
        await this.chatHistoryService.recordMessage(
          dto.sessionId,
          finalResponse.message,
          MessageRole.BOT,
        );

        return finalResponse;
      }
      // Sync intent
      // const intentResult = await this.intentService.extractAndSyncIntent(
      //   dto.sessionId,
      //   parsedData,
      //   currentIntent ?? undefined,
      //   dto.content,
      // );

      // let products = await this.searchService.searchByIntent(
      //   intentResult.intent as any,
      // );

      // if (products.length === 0 && intentResult.intent.features) {
      //   this.logger.warn(
      //     `Zero results for filters, trying relaxed search for session: ${dto.sessionId}`,
      //   );

      //   const relaxedIntent = {
      //     ...intentResult.intent,
      //     features: null,
      //   };

      //   products = await this.searchService.searchByIntent(
      //     relaxedIntent as any,
      //   );
      // }

      // const recommendations = await this.recOrchestrator.orchestrate(
      //   products,
      //   intentResult.intent as any,
      // );

      // await this.analytics.trackInteraction({
      //   sessionId: dto.sessionId,
      //   promptId: activePromptTemplate?.id,
      //   intent: intentResult.intent.categoryId || 'unknown',
      //   isZero: false,
      // });

      // const clarificationResult = await this.clarification.getClarification(
      //   intentResult.intent as any,
      //   parsedData.intent,
      // );

      // let finalResponse: FinalChatResponseDto;

      // if (clarificationResult.needsClarification) {
      //   finalResponse = await this.responseGen.generate(clarificationResult);
      // } else {
      //   if (recommendations?.products?.length > 0) {
      //     const topProductRef = products.find(
      //       (p) => p.id === recommendations.products[0].productId,
      //     );
      //     if (topProductRef) {
      //       this.logger.log(
      //         `Persisting context for product: ${topProductRef.name}`,
      //       );
      //       await this.sessionService.trackLastViewedProduct(
      //         dto.sessionId,
      //         topProductRef.id,
      //         topProductRef.name,
      //       );
      //     }
      //   }

      //   finalResponse = await this.responseGen.generate(
      //     undefined,
      //     recommendations,
      //   );

      const intentResult = await this.intentService.extractAndSyncIntent(
        dto.sessionId,
        parsedData,
        currentIntent ?? undefined,
        dto.content,
      );

      // --- NAYA LOGIC YAHAN SE SHURU HOTA HAI ---

      // 2. Pehle Clarification Check karein (GUARDRAIL)
      const clarificationResult = await this.clarification.getClarification(
        intentResult.intent as any,
        parsedData.intent,
      );

      let finalResponse: FinalChatResponseDto;

      if (clarificationResult.needsClarification) {
        // Agar info missing hai, toh yahin se response generate karein aur SEARCH SKIP kardein
        finalResponse = await this.responseGen.generate(clarificationResult);

        this.logger.log(
          `Clarification needed for session ${dto.sessionId}: ${clarificationResult.missingAttribute}`,
        );
      } else {
        // 3. Agar clarification nahi chahiye, sirf tab Search aur Recommendation execute karein
        let products = await this.searchService.searchByIntent(
          intentResult.intent as any,
        );

        // Relaxed search logic (if no results)
        if (products.length === 0 && intentResult.intent.features) {
          this.logger.warn(`Zero results for filters, trying relaxed search`);
          const relaxedIntent = { ...intentResult.intent, features: null };
          products = await this.searchService.searchByIntent(
            relaxedIntent as any,
          );
        }

        const recommendations = await this.recOrchestrator.orchestrate(
          products,
          intentResult.intent as any,
        );

        // Track successful interaction
        await this.analytics.trackInteraction({
          sessionId: dto.sessionId,
          promptId: activePromptTemplate?.id,
          intent: intentResult.intent.categoryId || 'unknown',
          isZero: false,
        });

        // Last Viewed Product track karein
        if (recommendations?.products?.length > 0) {
          const topProductRef = products.find(
            (p) => p.id === recommendations.products[0].productId,
          );
          if (topProductRef) {
            await this.sessionService.trackLastViewedProduct(
              dto.sessionId,
              topProductRef.id,
              topProductRef.name,
            );
          }
        }

        finalResponse = await this.responseGen.generate(
          undefined,
          recommendations,
        );

        // Naya logic yahn tak end hota hy
      }

      // Save bot response
      await this.chatHistoryService.recordMessage(
        dto.sessionId,
        finalResponse.message,
        MessageRole.BOT,
        finalResponse.recommendations,
      );

      // Cache response (5 min)
      await this.cacheManager.set(cacheKey, finalResponse, 300);

      if (finalResponse.recommendations?.totalMatches === 0) {
        await this.analytics.trackInteraction({
          sessionId: dto.sessionId,
          promptId: activePromptTemplate?.id,
          intent: 'ZERO_RESULTS',
          isZero: true,
        });
      }

      return finalResponse;
    } catch (error) {
      this.logger.error(`Chat Error: ${(error as any).message}`);

      await this.analytics.trackInteraction({
        sessionId: dto.sessionId,
        promptId: activePromptTemplate?.id,
        intent: 'SYSTEM_ERROR',
        isZero: true,
        metadata: {
          error: (error as any).message,
        },
      });

      return plainToInstance(FinalChatResponseDto, {
        message:
          "Maafi chahta hoon, system thora thak gaya hai. 😅 Kya aap apni search dobara 'Main Menu' se shuru karna chahenge ya koi aur product dhoondna hai?",
        actionType: ChatActionType.ERROR,
        metadata: {
          suggestionPrompts: [
            'Watches dikhao',
            'Laptops search karo',
            'Main Menu',
          ],
        },
      });
    }
  }

  private fallbackIntentParser(input: string, lastProduct?: string | null) {
    const text = input.toLowerCase();

    // 1. Better Brand & SKU Detection
    const brands = [
      'apple',
      'samsung',
      'sony',
      'infinix',
      'google',
      'dell',
      'hp',
    ];
    const foundBrand = brands.find((b) => text.includes(b));
    const skuMatch = input.match(/[A-Z0-9]+-[A-Z0-9]+/i); // Matches things like ABC-123

    // 2. Intent Detection (Keywords)
    const inquiryKeywords =
      /(detail|spec|batao|price|keemat|stock|khusosiyat|features|iski|isky)/i;
    const isInquiry = inquiryKeywords.test(text);

    // 3. Smart Category Mapping (Manual fallback)
    const categoryMap: Record<string, string[]> = {
      watches: ['watch', 'ghari', 'apple watch', 'wearable'],
      'android phones': ['mobile', 'phone', 'samsung', 'infinix', 'android'],
      electronics: ['laptop', 'pc', 'macbook', 'computer', 'device'],
    };

    let detectedCategory: string | null = null;
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((kw) => text.includes(kw))) {
        detectedCategory = cat;
        break;
      }
    }

    // 4. Budget Extraction (Handle 'k' and 'hazaar')
    let budget: number | null = null;
    const kMatch = text.match(/(\d+)\s*k/);
    const numericMatch = text.match(/(\d+)/);
    if (kMatch) budget = parseInt(kMatch[1]) * 1000;
    else if (numericMatch) budget = parseInt(numericMatch[0]);

    // 5. Logic Branching
    let intent = 'SHOPPING';
    let productIdentifier: string | null | undefined = skuMatch
      ? skuMatch[0]
      : null;

    if (isInquiry) {
      intent = 'PRODUCT_INQUIRY';
      productIdentifier =
        productIdentifier ||
        (foundBrand ? `${foundBrand} ${detectedCategory || ''}` : lastProduct);
    }

    return {
      intent,
      productIdentifier: productIdentifier || null,
      category: detectedCategory,
      budgetLimit: budget,
      features: {
        brand: foundBrand || null,
        color: text.includes('black')
          ? 'black'
          : text.includes('white')
            ? 'white'
            : null,
        size: null,
      },
    };
  }

  private detectCategory(text: string): string | null {
    if (text.includes('watch')) return 'watches';
    if (text.includes('phone') || text.includes('mobile'))
      return 'android phones';
    if (text.includes('laptop') || text.includes('macbook'))
      return 'electronics';
    return null;
  }

  private extractBudget(text: string): number | null {
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  private extractColor(text: string): string | null {
    const colors = ['black', 'white', 'blue', 'red'];
    return colors.find((c) => text.includes(c)) || null;
  }

  private extractSize(text: string): string | null {
    if (text.includes('small')) return 'small';
    if (text.includes('medium')) return 'medium';
    if (text.includes('large')) return 'large';
    return null;
  }

  private extractBrand(text: string): string | null {
    const brands = ['apple', 'samsung', 'sony', 'infinix'];
    return brands.find((b) => text.includes(b)) || null;
  }
}

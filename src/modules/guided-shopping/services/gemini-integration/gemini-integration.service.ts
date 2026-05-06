import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { AIIntegrationResponseDto } from '../../dto/response/guided-shoping-response.dto';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { GEMINI_CLIENT } from '../../provider/gemini.provider';
import { TemplateType } from '../../enums/chatbot.enum';
import { ChatbotRule } from '../../entities/chatbot-rule.entity';

// Services Integration
import { PromptManagementService } from '../prompt-management/prompt-management.service';
import { RuleManagementService } from '../rule-management/rule-management.service';
import { ChatbotAnalyticsService } from '../chatbot-analytics/chatbot-analytics.service';
import { CategoryService } from 'src/modules/products/services/category/category.service';

@Injectable()
export class GeminiIntegrationService {
  private readonly logger = new Logger(GeminiIntegrationService.name);

  private readonly DEFAULT_SYSTEM_INSTRUCTIONS = `
    You are a professional "Smart Shopping Assistant" for an e-commerce store.
    Your personality is helpful, concise, and expert-like.
    STRICT RULES:
    1. Only recommend products based on the user's intent.
    2. If the user's budget is lower than available products, suggest the closest cheaper alternative.
    3. Output must be STRICTLY in JSON format.
    4. Brands available: Sony, Apple, Samsung, Google, Infinix.
  `;

  constructor(
    @Inject(GEMINI_CLIENT) private readonly genAI: any,
    private readonly configService: ConfigService,
    private readonly promptService: PromptManagementService,
    private readonly ruleService: RuleManagementService,
    private readonly analyticsService: ChatbotAnalyticsService,
    private readonly categoryService: CategoryService,
  ) {}

  /**
   * Main completion method that combines Dynamic Prompts + Rules + Analytics
   */

  //   combinedPrompt = `
  // # ROLE: Data Extraction Engine
  // # INPUT: "${userPrompt}"
  // # CURRENT_CONTEXT: ${currentIntent ? JSON.stringify(currentIntent) : 'null'}

  // # CONTEXT RULES:
  // 1. REFERENTIAL AWARENESS:
  //    - If the user uses pronouns like "iski", "uske", "it", or "this", check CURRENT_CONTEXT for the last product and set "productIdentifier".

  // 2. SPECIFIC PRODUCT OVERRIDE (NEW):
  //    - If the user mentions a NEW specific product name or SKU in the INPUT (e.g., "Zfld", "A1", "Sony-Laptop"), you MUST prioritize this over the CURRENT_CONTEXT.
  //    - Set "productIdentifier" to this new name and "intent" to "PRODUCT_INQUIRY".

  // 3. STRICT BRAND-CATEGORY BINDING (NEW):
  //   - If ANY brand name is mentioned (e.g., Apple, Dell, Gucci, Nike, or any tech/fashion brand), extract it into "features.brand".
  //    - Do NOT limit yourself to a specific list; use your internal knowledge to identify brand names in the user's input.

  //    4. BRAND-CATEGORY BINDING:
  //    - Use the mentioned brand to refine the category if it's ambiguous.
  //    - Example: "Sony" usually implies "electronics", while "Adidas" implies "apparel/shoes".

  // 5. INTENT SWITCHING:
  //    - If user asks for "details", "specs", "features", or "price", ALWAYS set "intent": "PRODUCT_INQUIRY".

  // # EXTRACTION RULES:
  // 1. FUZZY BRAND MAPPING:
  //    - Map "Samsung" or "Sumsang" to "Samsung" in the brand feature.
  //    - Use internal knowledge to normalize other misspelled brands (e.g., "Nikke" -> "Nike").

  // 2. CATEGORY MAPPING:
  //    - watch/watches -> "watches"
  //    - phone/mobile -> "android phones"
  //    - laptop/macbook/pc -> "electronics"

  // 3. EXTRACTION:
  //    - Budget: Extract the full numerical value (e.g., "60k" or "60 hazaar" -> 60000). DO NOT return shortened values like 60.
  //    - Features:
  //      - ONLY extract "color" if the user explicitly mentions it in the current message.
  //      - Extract "brand" and "size" if available.

  // 4. CONTEXT PERSISTENCE & AMBIGUITY:
  //    - Use CURRENT_CONTEXT to fill missing values (like budget or color) if the user is continuing a conversation.
  //    - **CRITICAL:** If the user's intent is ambiguous (e.g., "Aur dikhao" or "Kuch aur?"), default to the last known "category" and "brand" from CURRENT_CONTEXT.

  // # OUTPUT FORMAT (STRICT JSON):
  // {
  //   "intent": "SHOPPING | PRODUCT_INQUIRY",
  //   "productIdentifier": "string or null",
  //   "category": "string or null",
  //   "budgetLimit": number or null,
  //   "features": {
  //     "brand": "string or null",
  //     "color": "string or null",
  //     "size": "string or null"
  //   }
  // }
  // `;

  async generateCompletion(
    userPrompt: string,
    sessionId: string,
    currentIntent?: any,
  ): Promise<AIIntegrationResponseDto> {
    return await this.handleRetry(async () => {
      // 1. Fetch Dynamic Context (with Fallbacks)
      const { activePromptContent, activePromptId, activeRules } =
        await this.getBotContext();

      const modelName =
        this.configService.get<string>('gemini.modelName') ||
        'gemini-2.5-flash';
      const temperature =
        this.configService.get<number>('gemini.temperature') ?? 0.1;
      const maxTokens =
        this.configService.get<number>('gemini.maxOutputTokens') ?? 2048;

      const categoryList = await this.categoryService.getCategoriesForAI();

      //       const combinedPrompt = `
      // # ROLE
      // You are a Data Extraction Engine for an E-commerce Chatbot.

      // # IMPORTANT CHANGE:
      // - DO NOT return categoryId
      // - ONLY return category as TEXT (e.g., "watches", "electronics")

      // # CURRENT_STATE:
      // ${currentIntent ? JSON.stringify(currentIntent) : '{"category": null, "budgetLimit": null, "features": {}}'}

      // # USER_INPUT:
      // "${userPrompt}"

      // # RULES:

      // 1. CATEGORY DETECTION:
      // - watch, watches → "watches"
      // - phone, mobile → "android phones"
      // - laptop, macbook → "electronics"
      // - gadgets, devices → "electronics"

      // 2. Normalize:
      // - lowercase everything
      // - remove plural confusion

      // 3. Extract:
      // - brand → features.brand
      // - color → features.color
      // - size → features.size

      // # OUTPUT:
      // {
      //   "category": "string or null",
      //   "budgetLimit": number or null,
      //   "features": {
      //     "brand": "string or null",
      //     "color": "string or null",
      //     "size": "string or null"
      //   }
      // }
      // `;

      //       const combinedPrompt = `
      // # ROLE: Data Extractor
      // # INPUT: "${userPrompt}"

      // # STRICT EXTRACTION RULES:
      // - If NO price is mentioned, set "budgetLimit" to null. NEVER use 1.
      // - If NO color is mentioned, set "features.color" to null. NEVER assume "black".
      // - If the user asks about a specific product (e.g., Apple-Watch-001), you MUST set "intent": "PRODUCT_INQUIRY" and "productIdentifier": "Apple-Watch-001".

      // # IMPORTANT:
      // If a value is missing, return null. DO NOT fill with placeholders.

      // # OUTPUT FORMAT (STRICT JSON):
      // {
      //   "intent": "SHOPPING | PRODUCT_INQUIRY",
      //   "productIdentifier": "string or null",
      //   "category": "string or null",
      //   "budgetLimit": null,
      //   "features": {
      //     "color": null,
      //     "size": null
      //   }
      // }
      // `;

      //       const combinedPrompt = `
      // # ROLE: Data Extraction Engine
      // # INPUT: "${userPrompt}"
      // # CURRENT_CONTEXT: ${currentIntent ? JSON.stringify(currentIntent) : 'null'}

      // # CONTEXT RULE:
      // 1. REFERENTIAL AWARENESS:
      //    - If the user uses pronouns like "iski", "uske", "it", or "this" (e.g., "iski details do"), check the CURRENT_STATE for the last viewed or recommended product.
      //    - If a product exists in CURRENT_STATE, set "intent": "PRODUCT_INQUIRY" and "productIdentifier" to that specific Product Name/SKU.

      // 2. INTENT SWITCHING:
      //    - If the user asks for "details", "specs", "features", or "price" of the current item, ALWAYS switch "intent" to "PRODUCT_INQUIRY".

      // 3. DEFAULT BEHAVIOR:
      //    - If no specific product is mentioned and NO product exists in CURRENT_STATE, keep "intent": "SHOPPING".

      // # RULES:
      // 1. INTENT DETECTION:
      //    - If user asks about a specific product/SKU (e.g. Apple-Watch-001), set "intent": "PRODUCT_INQUIRY".
      //    - Otherwise, set "intent": "SHOPPING".

      // 2. CATEGORY MAPPING:
      //    - watch/watches -> "watches"
      //    - phone/mobile -> "android phones"
      //    - laptop/macbook/pc -> "electronics"

      // 3. EXTRACTION:
      //    - Budget: Extract numbers only. If none, return null.
      //    - Features: Extract color, size, and brand into the features object.

      // 4. CONTEXT PERSISTENCE:
      //    - Use CURRENT_CONTEXT to fill missing values if the user is continuing a conversation.

      // # OUTPUT FORMAT (STRICT JSON):
      // {
      //   "intent": "SHOPPING | PRODUCT_INQUIRY",
      //   "productIdentifier": "string or null",
      //   "category": "string or null",
      //   "budgetLimit": number or null,
      //   "features": {
      //     "brand": "string or null",
      //     "color": "string or null",
      //     "size": "string or null"
      //   }
      // }
      // `;

      const combinedPrompt = `
      # ROLE: Data Extraction Engine
# INPUT: "${userPrompt}"
# CURRENT_CONTEXT: ${currentIntent ? JSON.stringify(currentIntent) : 'null'}

# CONTEXT RULES:
1. REFERENTIAL AWARENESS: 
   - If user uses pronouns ("it", "this", "iski", "uske"), check CURRENT_CONTEXT.productIdentifier.
   - If it exists, set intent: "PRODUCT_INQUIRY" and copy it to the output productIdentifier.

2. SPECIFIC PRODUCT OVERRIDE:
   - If user mentions a NEW model/SKU (e.g., "Sony-Laptop", "A1"), prioritize this.
   - Set "intent": "PRODUCT_INQUIRY" and "productIdentifier": "NEW_MODEL_NAME".

3. BRAND VS PRODUCT IDENTIFIER (CRITICAL):
   - A Brand (Sony, Apple) is NOT a productIdentifier. 
   - Put Brands in features.brand ONLY.
   - productIdentifier is ONLY for specific models or SKU names.

# EXTRACTION RULES:
1. INTENT SWITCHING: 
   - If user asks for "details", "specs", "price", or "stock", ALWAYS set intent: "PRODUCT_INQUIRY".
   - Otherwise, set intent: "SHOPPING".

2. BUDGET NORMALIZATION:
   - Always return numbers. "60k" -> 60000. "1 lac" -> 100000.

# OUTPUT FORMAT (STRICT JSON):
{
  "intent": "SHOPPING | PRODUCT_INQUIRY",
  "productIdentifier": "string or null",
  "category": "string or null",
  "budgetLimit": number or null,
  "features": {
    "brand": "string or null",
    "color": "string or null",
    "size": "string or null"
  }
}
      
      `;

      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: combinedPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: activePromptContent }],
        },
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;

      if (!text) {
        throw new InternalServerErrorException('Empty response from Gemini');
      }

      const validatedData = this.validateJsonResponse(text);

      this.logInteractionToAnalytics(sessionId, validatedData, activePromptId);

      return plainToInstance(AIIntegrationResponseDto, {
        rawResponse: text,
        parsedData: validatedData,
      });
    });
  }

  async explainProduct(userQuestion: string, product: any): Promise<string> {
    return await this.handleRetry(async () => {
      // 1. Database se Admin wala prompt lein
      const activePrompt = await this.promptService.getActivePrompt(
        TemplateType.SYSTEM_PROMPT,
      );

      // 2. Rule #3 ko khatam karein (Strict JSON instruction ko remove karein)
      // Taake humein conversational text mil sakay
      const sanitizedPrompt = activePrompt.content.replace(
        /STRICTLY in JSON format|Output must be STRICTLY in JSON/gi,
        'conversational and helpful text (Roman Urdu)',
      );

      // 3. Product context mapping
      const productContext = `
    [PRODUCT KNOWLEDGE]
    Name: ${product.name}
    Description: ${product.description || 'N/A'}
    Category: ${product.category?.name}
    Stock: ${product.variants.reduce((acc, v) => acc + (v.inventory?.stock || 0), 0)} units.
    Attributes: ${JSON.stringify(product.variants.map((v) => v.attributes))}
    [END KNOWLEDGE]
    `;

      const userTask = `
    Context Data: ${productContext}
    User Query: "${userQuestion}"
    
    Instruction: Use the knowledge provided above to explain why the user should buy this. 
    1. Be a professional salesperson but keep it SHORT (max 3-4 sentences).
    2. Use bullet points for key features.
    3. Answer in Roman Urdu.
    4. Focus only on: Why to buy, Price, and Stock.
    5. Avoid unnecessary greetings or long introductions.
    `;

      const modelName =
        this.configService.get<string>('gemini.modelName') ||
        'gemini-2.5-flash';

      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: userTask }],
          },
        ],
        // Injected Sanitized Prompt
        systemInstruction: {
          parts: [{ text: sanitizedPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'text/plain',
        },
      });

      return response.text;
    });
  }

  /**
   * Fetches the latest system prompt and active business rules from the database
   */
  private async getBotContext() {
    let activePromptContent: string;
    let activePromptId: string;
    let activeRules: ChatbotRule[] = [];

    try {
      // Prompt fetch with fallback
      const template = await this.promptService.getActivePrompt(
        TemplateType.SYSTEM_PROMPT,
      );

      activePromptContent = template.content;
      activePromptId = template.id;
    } catch (error) {
      this.logger.error(
        'Failed to fetch active prompt, using hardcoded fallback',
        (error as any).stack,
      );
      activePromptContent = this.DEFAULT_SYSTEM_INSTRUCTIONS;
      activePromptId = 'hardcoded-fallback';
    }

    try {
      // Rules fetch (Empty array if none exist or fails)
      activeRules = await this.ruleService.getRulesForBot();
    } catch (error) {
      this.logger.warn(
        'Failed to fetch business rules, proceeding without them',
      );
    }

    return { activePromptContent, activePromptId, activeRules };
  }

  /**
   * Fire-and-forget logging for the analytics dashboard
   */
  private logInteractionToAnalytics(
    sessionId: string,
    data: any,
    promptId: string,
  ) {
    this.analyticsService
      .trackInteraction({
        sessionId,
        promptId,
        intent: data.intent || 'general_query',
        isZero: !data.products || data.products.length === 0,
        metadata: { timestamp: new Date().toISOString() },
      })
      .catch((err) =>
        this.logger.error('Analytics tracking failed', err.stack),
      );
  }

  private validateJsonResponse(response: string): any {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error('LLM did not return valid JSON', response);
      throw new InternalServerErrorException('AI response format invalid');
    }
  }

  private async handleRetry<T>(
    call: () => Promise<T>,
    retries = 1,
  ): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        return await call();
      } catch (err) {
        lastError = err;
        const delay = Math.pow(2, i) * 1000;
        this.logger.warn(
          `Gemini API attempt ${i + 1} failed. Retrying in ${delay}ms...`,
        );
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw new InternalServerErrorException(
      `Gemini API failed after ${retries} attempts: ${lastError.message}`,
    );
  }
}

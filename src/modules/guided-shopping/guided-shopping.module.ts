import { Module } from '@nestjs/common';
import { GuidedShoppingService } from './services/guided-shopping.service';
import { GuidedShoppingController } from './controllers/guided-shopping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatSession } from './entities/chat-session.entity';
import { ShoppingIntent } from './entities/shopping-intent.entity';
import {
  RecommendationSession,
  RecommendedProduct,
} from './entities/recommendation-result.entity';
import { PromptTemplate } from './entities/prompt-template.entity';
import { ChatbotAuditLog } from './entities/chatbot_audit_logs.entity';
import { ChatSessionService } from './services/chat-session/chat-session.service';
import { MessageProcessorService } from './services/chat-message/chat-message.service';
import { GeminiIntegrationService } from './services/gemini-integration/gemini-integration.service';
import { IntentExtractionService } from './services/intent-extraction/intent-extraction.service';
import { ClarificationEngineService } from './services/clarification-engine/clarification-engine.service';
import { ProductSearchService } from './services/product-search-service/product-search-service.service';
import { RecommendationOrchestratorService } from './services/recommendation-orchestrator/recommendation-orchestrator.service';
import { ProductsModule } from '../products/products.module';
import { ChatMessageRepository } from './repositories/chatMessageRepository';
import { ChatSessionRepository } from './repositories/chatSessionRepository';
import { PromptTemplateRepository } from './repositories/promptTemplateRepository';
import { RecommendationRepository } from './repositories/recommendationRepository';
import { ShoppingIntentRepository } from './repositories/shoppingIntentRepository';
import { GuidedShoppingOrchestrator } from './services/guidedShoppingOrchestrator';
import { ResponseGenerationService } from './services/responseGenerationService';
import { ChatHistoryService } from './services/chat-history.service';
import { PromptManagementService } from './services/prompt-management/prompt-management.service';
import { CommonModule } from 'src/common/common.module';
import { PromptManagementController } from './controllers/prompt-management/prompt-management.controller';
import { ChatbotRule } from './entities/chatbot-rule.entity';
import { ChatbotInteraction } from './entities/chatbot-interaction.entity';
import { ChatbotInteractionRepository } from './repositories/chatbot-interaction.repository';
import { ChatbotRuleRepository } from './repositories/chatbot-rule.repository';
import { RuleManagementService } from './services/rule-management/rule-management.service';
import { ChatbotAnalyticsService } from './services/chatbot-analytics/chatbot-analytics.service';
import { AdminRuleController } from './controllers/admin-rule/admin-rule.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics/admin-analytics.controller';
import { ChatbotAuditLogRepository } from './repositories/chatbot-audit-log.repository';
import { ChatbotAuditLogService } from './services/chatbot-audit-log.service';
import { AdminAuditController } from './controllers/admin-audit.controller';
import { GeminiProvider } from './provider/gemini.provider';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSession,
      ChatMessage,
      ShoppingIntent,
      RecommendationSession,
      RecommendedProduct,
      PromptTemplate,
      ChatbotAuditLog,
      ChatbotRule,
      ChatbotInteraction,
    ]),
    ProductsModule,
    CommonModule,
  ],
  controllers: [
    GuidedShoppingController,
    PromptManagementController,
    AdminRuleController,
    AdminAnalyticsController,
    AdminAuditController,
  ],
  providers: [
    ChatGateway,
    GeminiProvider,
    ChatbotAuditLogService,
    ChatHistoryService,
    GuidedShoppingService,
    ChatSessionService,
    MessageProcessorService,
    GeminiIntegrationService,
    IntentExtractionService,
    ClarificationEngineService,
    ProductSearchService,
    RecommendationOrchestratorService,
    GuidedShoppingOrchestrator,
    ResponseGenerationService,
    ChatMessageRepository,
    ChatSessionRepository,
    PromptTemplateRepository,
    RecommendationRepository,
    ShoppingIntentRepository,
    PromptManagementService,
    ChatbotInteractionRepository,
    ChatbotAuditLogRepository,
    ChatbotRuleRepository,
    RuleManagementService,
    ChatbotAnalyticsService,
  ],
})
export class GuidedShoppingModule {}

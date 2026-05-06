import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  UseFilters,
} from '@nestjs/common';
import { GuidedShoppingOrchestrator } from '../services/guidedShoppingOrchestrator';
import { CreateChatMessageDto } from '../dto/chat-message.dto';
import { FinalChatResponseDto } from '../dto/response/guided-shoping-response.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { ChatbotExceptionFilter } from '../filters/chatbot-exception.filter';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSessionService } from '../services/chat-session/chat-session.service';
import { ChatHistoryService } from '../services/chat-history.service';
import { CreateChatSessionDto } from '../dto/chat-session.dto';

@Controller('guided-shopping')
export class GuidedShoppingController {
  constructor(
    private readonly orchestrator: GuidedShoppingOrchestrator,
    private readonly sessionService: ChatSessionService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  async startSession(@Req() req: any, @Body() dto: CreateChatSessionDto) {
    dto.buyerId = req.user.id;
    if (!dto.expiresAt) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      dto.expiresAt = expirationDate;
    } else {
      dto.expiresAt = new Date(dto.expiresAt);
    }

    return await this.sessionService.initializeSession(dto);
  }

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ChatbotExceptionFilter)
  async handleChat(
    @Body() dto: CreateChatMessageDto,
    @Req() req: any,
  ): Promise<FinalChatResponseDto> {
    const buyerId = req.user?.id;
    return await this.orchestrator.handleUserMessage(dto, buyerId);
  }

  @Get('sessions/:sessionId/history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ): Promise<ChatMessage[]> {
    await this.sessionService.validateOwnership(sessionId, req.user.id);
    return await this.chatHistoryService.getSessionHistory(sessionId);
  }
}

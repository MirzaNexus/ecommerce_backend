import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateChatMessageDto } from '../dto/chat-message.dto';
import { GuidedShoppingOrchestrator } from '../services/guidedShoppingOrchestrator';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(private readonly orchestrator: GuidedShoppingOrchestrator) {}

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() dto: CreateChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.emit('bot_status', { typing: true });

    try {
      const response = await this.orchestrator.handleUserMessage(dto);
      client.emit('new_message', response);
    } finally {
      client.emit('bot_status', { typing: false });
    }
  }
}

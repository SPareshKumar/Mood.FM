import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto, ChatResponse } from './dto/chat.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Body() chatMessageDto: ChatMessageDto): Promise<ChatResponse> {
    try {
      if (!chatMessageDto.message?.trim()) {
        throw new HttpException('Message cannot be empty', HttpStatus.BAD_REQUEST);
      }

      return await this.chatbotService.processMessage(chatMessageDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to process chat message',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
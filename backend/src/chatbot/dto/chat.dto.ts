import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  userId?: string; // Optional for now, can be added later for user-specific analysis
}

export interface ChatResponse {
  response: string;
  timestamp: Date;
  includesMoodAnalysis?: boolean;
}
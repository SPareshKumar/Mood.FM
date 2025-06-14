import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessageDto, ChatResponse } from './dto/chat.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY environment variable is not set');
      throw new Error('GEMINI_API_KEY is required for ChatbotService');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Updated model name - use one of these current models:
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // Alternative models you can try:
    // this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    // this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
  }

  async processMessage(chatMessageDto: ChatMessageDto): Promise<ChatResponse> {
    const { message } = chatMessageDto;
    
    try {
      // Check if the message is asking for mood analysis
      const isMoodAnalysisQuery = this.isMoodAnalysisQuery(message);
      
      let prompt = this.buildBasePrompt();
      
      if (isMoodAnalysisQuery) {
        const moodData = await this.getMoodAnalysisData();
        prompt += this.buildMoodAnalysisPrompt(moodData);
      }
      
      prompt += `\n\nUser Question: ${message}\n\nPlease provide a helpful response:`;
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      return {
        response: response.text(),
        timestamp: new Date(),
        includesMoodAnalysis: isMoodAnalysisQuery
      };
    } catch (error) {
      this.logger.error('Error processing chatbot message:', error);
      
      // More specific error handling
      if (error.message?.includes('models/') || error.message?.includes('not found')) {
        this.logger.error('Model not found. Please check if the Gemini model name is correct.');
      }
      
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
    }
  }

  private buildBasePrompt(): string {
    return `You are a supportive mental health assistant integrated into a mood tracking application. Your role is to:

1. Provide general mental health support and information
2. Offer coping strategies and wellness tips
3. Analyze user mood patterns when requested
4. Encourage healthy habits and self-care

Guidelines:
- Be empathetic, supportive, and non-judgmental
- Provide evidence-based mental health information
- Always recommend professional help for serious mental health concerns
- Keep responses concise but helpful (2-3 paragraphs maximum)
- If asked about mood patterns, provide insights based on the data provided

Important: You are not a replacement for professional therapy or medical advice. Always encourage users to seek professional help when needed.`;
  }

  private buildMoodAnalysisPrompt(moodData: any): string {
    return `\n\nMood Analysis Data:
- Recent mood entries: ${JSON.stringify(moodData.recentEntries)}
- Average mood: ${moodData.averageMood}
- Mood trend: ${moodData.trend}
- Most common mood: ${moodData.mostCommonMood}
- Days tracked: ${moodData.totalDays}

Please analyze this mood data and provide insights about patterns, trends, and suggestions for improvement.`;
  }

  private isMoodAnalysisQuery(message: string): boolean {
    const moodKeywords = [
      'mood pattern', 'mood trend', 'analyze', 'analysis', 'how am i doing',
      'my mood', 'mood history', 'pattern', 'trend', 'progress', 'improvement'
    ];
    
    const lowerMessage = message.toLowerCase();
    return moodKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async getMoodAnalysisData() {
    try {
      // Get recent mood entries (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentEntries = await this.prisma.moodEntry.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });

      // Calculate statistics
      const moods = recentEntries.map(entry => entry.mood);
      const averageMood = moods.length > 0 ? 
        moods.reduce((sum, mood) => sum + mood, 0) / moods.length : 0;

      // Determine trend (comparing first half vs second half of entries)
      let trend = 'stable';
      if (moods.length >= 4) {
        const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
        const secondHalf = moods.slice(Math.floor(moods.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, mood) => sum + mood, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, mood) => sum + mood, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.5) trend = 'improving';
        else if (secondAvg < firstAvg - 0.5) trend = 'declining';
      }

      // Find most common mood
      const moodCounts = moods.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const mostCommonMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '0';

      return {
        recentEntries: recentEntries.map(entry => ({
          mood: entry.mood,
          emoji: entry.moodEmoji,
          date: entry.createdAt.toISOString().split('T')[0]
        })),
        averageMood: Math.round(averageMood * 10) / 10,
        trend,
        mostCommonMood: parseInt(mostCommonMood),
        totalDays: recentEntries.length
      };
    } catch (error) {
      this.logger.error('Error fetching mood analysis data:', error);
      return {
        recentEntries: [],
        averageMood: 0,
        trend: 'unknown',
        mostCommonMood: 0,
        totalDays: 0
      };
    }
  }
}
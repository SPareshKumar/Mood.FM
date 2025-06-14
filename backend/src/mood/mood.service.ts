import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoodService {
  constructor(private prisma: PrismaService) {}

  async createMoodEntry(mood: number, moodEmoji: string) {
    return this.prisma.moodEntry.create({
      data: {
        mood,
        moodEmoji,
      },
    });
  }

  async getMoodData() {
    const entries = await this.prisma.moodEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Group by date for heatmap
    const groupedData = entries.reduce((acc, entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry.mood);
      return acc;
    }, {});

    // Calculate average mood per day
    const heatmapData = Object.entries(groupedData).map(([date, moods]: [string, number[]]) => ({
      date,
      mood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      count: moods.length,
    }));

    return heatmapData;
  }

  async getRecentMoodEntries(limit: number = 10) {
    return this.prisma.moodEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
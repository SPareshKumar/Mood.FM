import { Controller, Post, Get, Body } from '@nestjs/common';
import { MoodService } from './mood.service';
import { SpotifyService } from '../spotify/spotify.service';

@Controller('mood')
export class MoodController {
  constructor(
    private moodService: MoodService,
    private spotifyService: SpotifyService
  ) {}

  @Post()
  async createMoodEntry(@Body() body: { mood: number; moodEmoji: string }) {
    return this.moodService.createMoodEntry(body.mood, body.moodEmoji);
  }

  @Post('/recommend')
  async getPlaylistRecommendation(@Body() body: { mood: number; moodEmoji: string }) {
    // Create mood entry
    const moodEntry = await this.moodService.createMoodEntry(body.mood, body.moodEmoji);
    
    // Get playlist recommendation from Spotify
    const playlist = await this.spotifyService.getPlaylistByMood(body.mood);
    
    // For now, we'll just return the data without storing playlist details
    // You can add a separate PlaylistLog table later if needed
    return {
      moodEntry,
      playlist,
    };
  }

  @Get('/heatmap')
  async getMoodHeatmap() {
    return this.moodService.getMoodData();
  }

  @Get('/recent')
  async getRecentMoodEntries() {
    return this.moodService.getRecentMoodEntries();
  }
}
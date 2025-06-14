import { Controller, Get, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private spotifyService: SpotifyService) {}

  @Get('/playlist')
  async getPlaylist(@Query('mood') mood: string) {
    const moodNumber = parseInt(mood);
    return this.spotifyService.getPlaylistByMood(moodNumber);
  }
}
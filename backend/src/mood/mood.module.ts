import { Module } from '@nestjs/common';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  imports: [SpotifyModule],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
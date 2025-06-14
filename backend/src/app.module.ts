import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MoodModule } from './mood/mood.module';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MoodModule,
    SpotifyModule,
  ],
})
export class AppModule {}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  private accessToken: string;
  
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

  async getAccessToken() {
    try {
      const clientId = this.configService.get('SPOTIFY_CLIENT_ID');
      const clientSecret = this.configService.get('SPOTIFY_CLIENT_SECRET');
      
      console.log('🔑 Spotify Client ID:', clientId ? 'Present' : 'Missing');
      console.log('🔑 Spotify Client Secret:', clientSecret ? 'Present' : 'Missing');
      
      if (!clientId || !clientSecret) {
        throw new Error('Spotify credentials are missing from environment variables');
      }
      
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
        }
      );
      
      this.accessToken = response.data.access_token;
      console.log('✅ Spotify access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Spotify access token:', error.message);
      if (error.response) {
        console.error('Spotify API Response:', error.response.data);
      }
      throw error;
    }
  }

  async getPlaylistByMood(mood: number) {
    try {
      console.log(`🎵 Getting playlist for mood: ${mood}`);
      
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      // Enhanced mood mapping with multiple search queries for variety
      const moodQueries = {
        1: [ // Very sad
          'sad acoustic indie',
          'melancholic piano',
          'emotional ballads',
          'heartbreak songs',
          'sad indie folk',
          'crying songs'
        ],
        2: [ // Sad
          'melancholic indie folk',
          'sad alternative',
          'emotional indie',
          'downtempo sad',
          'indie melancholy',
          'soft sad music'
        ],
        3: [ // Neutral
          'chill pop indie',
          'indie rock mellow',
          'alternative chill',
          'indie pop calm',
          'relaxing indie',
          'ambient indie'
        ],
        4: [ // Happy
          'happy pop dance',
          'upbeat indie pop',
          'feel good music',
          'positive vibes',
          'happy alternative',
          'uplifting songs'
        ],
        5: [ // Very happy
          'energetic dance party',
          'upbeat electronic',
          'high energy pop',
          'dance hits',
          'party music',
          'euphoric music'
        ],
      };

      // Get recently played playlists for this mood to avoid repetition
      const recentPlaylists = await this.getRecentPlaylistsForMood(mood);
      const recentPlaylistIds = recentPlaylists.map(p => p.playlistId);
      
      console.log(`📚 Recent playlist IDs for mood ${mood}:`, recentPlaylistIds);

      const queries = moodQueries[mood] || moodQueries[3];
      let selectedPlaylist: any = null;
      let attemptedQueries: string[] = [];
      
      // Shuffle queries for more randomness
      const shuffledQueries = [...queries].sort(() => Math.random() - 0.5);
      console.log(`🔀 Shuffled queries:`, shuffledQueries);
      
      // Try different queries until we find a playlist we haven't used recently
      for (let i = 0; i < shuffledQueries.length && !selectedPlaylist; i++) {
        const query = shuffledQueries[i];
        attemptedQueries.push(query);
        
        console.log(`🔍 Searching with query: "${query}"`);
        
        try {
          const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
            }
          );

          // Filter out null playlists first
          const validPlaylists = response.data.playlists.items.filter(playlist => playlist !== null && playlist.id);
          console.log(`📊 Found ${response.data.playlists.items.length} playlists (${validPlaylists.length} valid) for query: "${query}"`);

          // Find playlists that haven't been used recently
          const availablePlaylists = validPlaylists.filter(
            playlist => !recentPlaylistIds.includes(playlist.id)
          );

          console.log(`✅ Available (unused) playlists: ${availablePlaylists.length}`);

          if (availablePlaylists.length > 0) {
            // Randomly select from available playlists
            const randomIndex = Math.floor(Math.random() * availablePlaylists.length);
            selectedPlaylist = availablePlaylists[randomIndex];
            console.log(`🎯 Selected playlist: "${selectedPlaylist.name}" (ID: ${selectedPlaylist.id})`);
            break;
          }
        } catch (error) {
          console.error(`❌ Error searching with query "${query}":`, error.message);
          if (error.response?.status === 401) {
            console.log('🔄 Access token expired, refreshing...');
            await this.getAccessToken();
            // Retry the same query
            i--;
            continue;
          }
          continue;
        }
      }

      // If no new playlist found, get more playlists with a broader search
      if (!selectedPlaylist) {
        console.log(`⚠️ No unused playlists found, trying broader search...`);
        
        try {
          const broadQuery = queries[0].split(' ')[0]; // Use first word of first query
          console.log(`🔍 Broad search with: "${broadQuery}"`);
          
          const fallbackResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(broadQuery)}&type=playlist&limit=50`,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
            }
          );
          
          // Filter out null playlists first
          const allPlaylists = fallbackResponse.data.playlists.items.filter(playlist => playlist !== null && playlist.id);
          console.log(`📊 Broad search found ${fallbackResponse.data.playlists.items.length} playlists (${allPlaylists.length} valid)`);
          
          if (allPlaylists.length > 0) {
            // First try to get one we haven't used recently
            const unusedPlaylists = allPlaylists.filter(
              playlist => !recentPlaylistIds.includes(playlist.id)
            );
            
            if (unusedPlaylists.length > 0) {
              const randomIndex = Math.floor(Math.random() * unusedPlaylists.length);
              selectedPlaylist = unusedPlaylists[randomIndex];
              console.log(`🎯 Selected unused playlist from broad search: "${selectedPlaylist.name}"`);
            } else {
              // If all have been used recently, just pick a random one
              const randomIndex = Math.floor(Math.random() * allPlaylists.length);
              selectedPlaylist = allPlaylists[randomIndex];
              console.log(`🎯 Selected random playlist (all were recently used): "${selectedPlaylist.name}"`);
            }
          }
        } catch (error) {
          console.error('❌ Broad search failed:', error.message);
          if (error.response) {
            console.error('Spotify API Response:', error.response.data);
          }
          throw new Error('No playlist found');
        }
      }

      if (!selectedPlaylist) {
        console.error('❌ No playlist could be found after all attempts');
        throw new Error('No playlist found');
      }

      // Get playlist tracks
      try {
        console.log(`🎼 Fetching tracks for playlist: ${selectedPlaylist.id}`);
        
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/playlists/${selectedPlaylist.id}/tracks?limit=10`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        console.log(`🎵 Found ${tracksResponse.data.items.length} tracks`);

        // Store this playlist selection to avoid repetition
        await this.storePlaylistSelection(mood, selectedPlaylist.id);

        const result = {
          id: selectedPlaylist.id,
          name: selectedPlaylist.name,
          description: selectedPlaylist.description,
          image: selectedPlaylist.images?.[0]?.url,
          external_url: selectedPlaylist.external_urls?.spotify,
          tracks: tracksResponse.data.items
            .filter(item => item && item.track) // Filter out null items and tracks
            .map(item => ({
              name: item.track?.name || 'Unknown Track',
              artist: item.track?.artists?.[0]?.name || 'Unknown Artist',
              preview_url: item.track?.preview_url,
            }))
            .filter(track => track.name !== 'Unknown Track'), // Filter out null tracks
        };
        
        console.log(`✅ Successfully returning playlist: "${result.name}" with ${result.tracks.length} tracks`);
        return result;
        
      } catch (error) {
        console.error('❌ Error fetching playlist tracks:', error.message);
        if (error.response) {
          console.error('Spotify API Response:', error.response.data);
        }
        throw new Error('Failed to fetch playlist tracks');
      }
    } catch (error) {
      console.error('❌ Fatal error in getPlaylistByMood:', error.message);
      throw error;
    }
  }

  private async getRecentPlaylistsForMood(mood: number, limit: number = 10) {
    console.log(`📚 Getting recent playlists for mood ${mood}`);
    
    try {
      // Test database connection first
      console.log('🔍 Testing database connection...');
      
      // Get playlists used for this mood in the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const recent = await this.prisma.playlistHistory.findMany({
        where: {
          mood: mood,
          createdAt: {
            gte: threeDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
      
      console.log(`📚 Found ${recent.length} recent playlists for mood ${mood}`);
      return recent;
      
    } catch (error) {
      console.error('❌ Database error in getRecentPlaylistsForMood:', error.message);
      console.error('Error details:', error);
      console.log('🔧 Returning empty array - playlist history unavailable');
      return [];
    }
  }

  private async storePlaylistSelection(mood: number, playlistId: string) {
    console.log(`💾 Storing playlist selection: mood=${mood}, playlistId=${playlistId}`);
    
    try {
      await this.prisma.playlistHistory.create({
        data: {
          mood,
          playlistId,
        },
      });
      
      console.log(`✅ Playlist selection stored successfully`);

      // Clean up old entries (keep only last 20 entries per mood)
      const oldEntries = await this.prisma.playlistHistory.findMany({
        where: { mood },
        orderBy: { createdAt: 'desc' },
        skip: 20,
      });

      if (oldEntries.length > 0) {
        await this.prisma.playlistHistory.deleteMany({
          where: {
            id: {
              in: oldEntries.map(entry => entry.id),
            },
          },
        });
        console.log(`🧹 Cleaned up ${oldEntries.length} old playlist history entries`);
      }
    } catch (error) {
      console.error('❌ Error storing playlist selection:', error.message);
      console.error('Error details:', error);
      console.log('⚠️ Continuing without storing history...');
      // Don't throw error, just log it as this is not critical for functionality
    }
  }
}
'use client';

import { useState } from 'react';
import MoodSlider from '../components/MoodSlider';
import PlaylistCard from '../components/PlaylistCard';
import MoodHeatmap from '../components/MoodHeatmap';
import { api } from '../lib/api';
import FuzzyText from '../components/FuzzyText/FuzzyText';

const moodEmojis = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '😊',
  5: '😄',
};

export default function Home() {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoodSubmit = async (mood: number) => {
    setLoading(true);
    setError(null);

    try {
      // Option 1: Use the existing spotify/playlist endpoint directly
      const playlist = await api.getPlaylist(mood);
      setPlaylist(playlist);

      // Optionally save mood separately
      try {
        await api.saveMood(mood, moodEmojis[mood as keyof typeof moodEmojis]);
      } catch (moodError) {
        console.warn('Failed to save mood, but continuing with playlist:', moodError);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get playlist recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg text-center">
            <div className="flex justify-center">
              <FuzzyText 
                baseIntensity={0.2} 
                hoverIntensity={0.5} 
                enableHover={true}
              >Mood.FM</FuzzyText>
            </div>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
           Your Mood, Your Music, Your Moment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Mood Input */}
          <div className="space-y-8">
            <MoodSlider onSubmit={handleMoodSubmit} loading={loading} />
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1">
              <MoodHeatmap />
            </div>
          </div>
          
          {/* Right Column - Playlist Results */}
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            {!playlist && !loading && !error && (
              <div className="text-center text-white/80 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-6xl mb-4">🎧</div>
                <h3 className="text-xl font-semibold mb-2">Ready to discover your perfect mood playlist?</h3>
                <p className="text-white/70">Select your mood and hit "Get My Playlist" to get started!</p>
              </div>
            )}

            {error && (
              <div className="text-center text-white bg-red-500/20 backdrop-blur-sm rounded-2xl p-8 border border-red-300/30">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
                <p className="text-white/90">{error}</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center text-white bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">Curating your perfect playlist...</h3>
                  <p className="text-white/80">Analyzing your mood and finding the best tracks</p>
                </div>
              </div>
            )}
            
            {playlist && !loading && (
              <div className="w-full max-w-md">
                <PlaylistCard playlist={playlist} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/60">
          <p>Powered by Spotify API • Built with ❤️ to keep you calm always</p>
        </div>
      </div>
    </div>
  );
}
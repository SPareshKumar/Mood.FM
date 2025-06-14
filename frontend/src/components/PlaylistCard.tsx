'use client';

import { ExternalLink, Play, Pause, Heart, MoreHorizontal, Clock, Music } from 'lucide-react';
import { useState } from 'react';

interface Track {
  name: string;
  artist: string;
  preview_url: string | null;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  external_url: string;
  tracks: Track[];
}

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  const playPreview = (previewUrl: string, trackName: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    if (playingTrack === trackName) {
      setPlayingTrack(null);
      setCurrentAudio(null);
      return;
    }

    const audio = new Audio(previewUrl);
    audio.play();
    setCurrentAudio(audio);
    setPlayingTrack(trackName);

    audio.onended = () => {
      setPlayingTrack(null);
      setCurrentAudio(null);
    };
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full max-w-md mx-auto bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className="relative">
        {/* Playlist Cover */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={playlist.image || '/placeholder-playlist.jpg'}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Play Button Overlay */}
          <div className={`absolute bottom-6 right-6 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <button className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105">
              <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
            </button>
          </div>
        </div>
        
        {/* Playlist Info */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Playlist</span>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2 line-clamp-2">
            {playlist.name}
          </h1>
          
          {playlist.description && (
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {playlist.description}
            </p>
          )}
          
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Music className="w-4 h-4" />
            <span>{playlist.tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-4 flex items-center gap-4">
        <button className="w-12 h-12 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
          <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
        </button>
        
        <button className="text-gray-400 hover:text-green-400 transition-colors">
          <Heart className="w-6 h-6" />
        </button>
        
        <a
          href={playlist.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Spotify
        </a>
      </div>

      {/* Track List */}
      <div className="px-6 pb-6">
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-700/50">
            <div className="col-span-1">#</div>
            <div className="col-span-8">Title</div>
            <div className="col-span-3 text-right">
              <Clock className="w-4 h-4 inline" />
            </div>
          </div>
          
          {/* Tracks */}
          {playlist.tracks.slice(0, 5).map((track, index) => (
            <div 
              key={index}
              className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-md transition-all duration-200 group cursor-pointer ${
                hoveredTrack === track.name ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              onMouseEnter={() => setHoveredTrack(track.name)}
              onMouseLeave={() => setHoveredTrack(null)}
            >
              {/* Track Number / Play Button */}
              <div className="col-span-1 flex items-center">
                {hoveredTrack === track.name && track.preview_url ? (
                  <button
                    onClick={() => playPreview(track.preview_url!, track.name)}
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    {playingTrack === track.name ? (
                      <Pause className="w-4 h-4" fill="currentColor" />
                    ) : (
                      <Play className="w-4 h-4" fill="currentColor" />
                    )}
                  </button>
                ) : (
                  <span className={`text-sm ${playingTrack === track.name ? 'text-green-400' : 'text-gray-400 group-hover:text-white'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Track Info */}
              <div className="col-span-8 min-w-0">
                <div className={`font-medium truncate ${playingTrack === track.name ? 'text-green-400' : 'text-white'}`}>
                  {track.name}
                </div>
                <div className="text-sm text-gray-400 truncate">
                  {track.artist}
                </div>
              </div>
              
              {/* Duration / Preview Status */}
              <div className="col-span-3 flex items-center justify-end">
                {track.preview_url ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playPreview(track.preview_url!, track.name)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200"
                    >
                      {playingTrack === track.name ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-sm text-gray-400">0:30</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">No preview</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show More */}
        {playlist.tracks.length > 5 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <button className="text-gray-400 hover:text-white text-sm transition-colors">
              {playlist.tracks.length} songs
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-black/20 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Made for you</span>
          <span>Spotify</span>
        </div>
      </div>
    </div>
  );
}
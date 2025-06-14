'use client';

import { useState } from 'react';
import { Music } from 'lucide-react';

interface MoodSliderProps {
  onSubmit: (mood: number) => void;
  loading?: boolean;
}

const moodEmojis = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '😊',
  5: '😄',
};

const moodLabels = {
  1: 'Very Sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Very Happy',
};

const moodColors = {
  1: 'from-blue-400 to-blue-600',
  2: 'from-blue-300 to-blue-500',
  3: 'from-gray-400 to-gray-600',
  4: 'from-yellow-400 to-orange-500',
  5: 'from-green-400 to-green-600',
};

export default function MoodSlider({ onSubmit, loading = false }: MoodSliderProps) {
  const [mood, setMood] = useState(3);

  const handleSubmit = () => {
    onSubmit(mood);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          How are you feeling today?
        </h2>
        
        <div className="text-center mb-8">
          <div 
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${moodColors[mood as keyof typeof moodColors]} mb-4 shadow-lg`}
          >
            <span className="text-4xl">{moodEmojis[mood as keyof typeof moodEmojis]}</span>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            {moodLabels[mood as keyof typeof moodLabels]}
          </div>
        </div>

        <div className="relative mb-8">
          <input
            type="range"
            min="1"
            max="5"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((mood - 1) / 4) * 100}%, #e5e7eb ${((mood - 1) / 4) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between mt-3">
            {Object.entries(moodEmojis).map(([value, emoji]) => (
              <button
                key={value}
                onClick={() => setMood(Number(value))}
                className={`text-2xl p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  mood === Number(value) 
                    ? 'bg-white shadow-md scale-110' 
                    : 'hover:bg-white/50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Finding your perfect playlist...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Music size={20} />
              Get My Playlist
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
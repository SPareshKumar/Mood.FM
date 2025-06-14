const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  async saveMood(mood: number, moodEmoji: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood, moodEmoji }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error saving mood:', error);
      throw error;
    }
  },

  async getPlaylist(mood: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/spotify/playlist?mood=${mood}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting playlist:', error);
      throw error;
    }
  },

  async getMoodHeatmap() {
    try {
      const response = await fetch(`${API_BASE_URL}/mood/heatmap`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting heatmap:', error);
      throw error;
    }
  },
};
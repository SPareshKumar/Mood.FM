'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface MoodData {
  date: string;
  mood: number;
  count: number;
}

export default function MoodHeatmap() {
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPeriod, setViewPeriod] = useState<'3months' | '6months' | '1year'>('3months');

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      const data = await api.getMoodHeatmap();
      setMoodData(data);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColorClass = (mood: number, count: number) => {
    if (count === 0) return 'bg-gray-100';
    
    const rounded = Math.round(mood);
    const intensity = Math.min(count / 3, 1);
    
    // Use fixed Tailwind classes instead of dynamic ones
    const intensityLevel = intensity > 0.8 ? 'dark' : intensity > 0.5 ? 'medium' : 'light';
    
    const colorClasses = {
      1: {
        light: 'bg-red-200',
        medium: 'bg-red-400', 
        dark: 'bg-red-500'
      },
      2: {
        light: 'bg-orange-200',
        medium: 'bg-orange-400',
        dark: 'bg-orange-500'
      },
      3: {
        light: 'bg-yellow-200', 
        medium: 'bg-yellow-400',
        dark: 'bg-yellow-500'
      },
      4: {
        light: 'bg-green-200',
        medium: 'bg-green-400', 
        dark: 'bg-green-500'
      },
      5: {
        light: 'bg-blue-200',
        medium: 'bg-blue-400',
        dark: 'bg-blue-500'
      }
    };
    
    return colorClasses[rounded as keyof typeof colorClasses]?.[intensityLevel] || 'bg-gray-200';
  };

  const getDaysToShow = () => {
    const days = {
      '3months': 90,
      '6months': 180, 
      '1year': 365
    };
    return days[viewPeriod];
  };

  const generateCalendarData = () => {
    const today = new Date();
    const daysToShow = getDaysToShow();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (daysToShow - 1));
    
    const calendarData = [];
    const moodMap = new Map(moodData.map(entry => [entry.date, entry]));
    
    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      const moodEntry = moodMap.get(dateString);
      calendarData.push({
        date: dateString,
        mood: moodEntry?.mood || 0,
        count: moodEntry?.count || 0,
        dayOfWeek: currentDate.getDay(),
        month: currentDate.getMonth(),
        day: currentDate.getDate()
      });
    }
    
    return calendarData;
  };

  const getWeeksData = () => {
    const calendarData = generateCalendarData();
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    // Start with the first date's day of week
    const firstDayOfWeek = calendarData[0]?.dayOfWeek || 0;
    
    // Add empty cells for the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    calendarData.forEach((day, index) => {
      currentWeek.push(day);
      
      // Complete week or last day
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      } else if (index === calendarData.length - 1) {
        // Fill remaining days in last week
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push([...currentWeek]);
      }
    });
    
    return weeks;
  };

  const getMonthLabels = () => {
    const calendarData = generateCalendarData();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels: { month: string; position: number }[] = [];
    
    let lastMonth = -1;
    let weekIndex = 0;
    
    calendarData.forEach((day, index) => {
      if (day.month !== lastMonth) {
        const weekPosition = Math.floor(index / 7);
        monthLabels.push({
          month: months[day.month],
          position: weekPosition
        });
        lastMonth = day.month;
      }
    });
    
    return monthLabels;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">Loading mood data...</div>
      </div>
    );
  }

  const weeksData = getWeeksData();
  const monthLabels = getMonthLabels();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Your Mood Calendar</h3>
        
        {/* Period selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['3months', '6months', '1year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setViewPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === '3months' ? '3M' : period === '6months' ? '6M' : '1Y'}
            </button>
          ))}
        </div>
      </div>
      
      {moodData.length === 0 ? (
        <p className="text-gray-500">No mood data yet. Start tracking your mood!</p>
      ) : (
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="calendar-container">
            {/* Month labels */}
            <div className="flex mb-2 ml-8">
              {monthLabels.map((label, index) => (
                <div 
                  key={`${label.month}-${index}`}
                  className="text-xs text-gray-500 absolute"
                  style={{ 
                    left: `${label.position * 16 + 32}px`,
                    minWidth: '24px'
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>
            
            {/* Calendar grid with day labels */}
            <div className="flex mt-6">
              {/* Day labels */}
              <div className="flex flex-col mr-2 text-xs text-gray-500 justify-between" style={{ height: `${weeksData.length * 16}px` }}>
                {weekDays.map((day, index) => (
                  <div key={index} className="h-4 flex items-center text-right" style={{ minWidth: '12px' }}>
                    {index % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="flex space-x-1">
                {weeksData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col space-y-1">
                    {week.map((day: any, dayIndex: number) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`
                          w-3 h-3 rounded-sm border border-gray-200 transition-all duration-200 hover:scale-125 cursor-pointer
                          ${day 
                            ? getMoodColorClass(day.mood, day.count)
                            : 'bg-transparent border-transparent'
                          }
                        `}
                        title={day ? 
                          `${new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}: ${day.count > 0 ? 
                            `Mood ${day.mood.toFixed(1)} (${day.count} ${day.count === 1 ? 'entry' : 'entries'})` : 
                            'No entries'
                          }` : ''
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-200 border border-gray-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-400 border border-gray-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-500 border border-gray-200 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
            
            {/* Mood color legend */}
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded-sm border border-gray-200"></div>
                <span>Sad</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-400 rounded-sm border border-gray-200"></div>
                <span>Down</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-sm border border-gray-200"></div>
                <span>Okay</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded-sm border border-gray-200"></div>
                <span>Good</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded-sm border border-gray-200"></div>
                <span>Great</span>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {moodData.length}
              </div>
              <div className="text-sm text-gray-600">Total entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {moodData.length > 0 ? 
                  (moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length).toFixed(1) : 
                  '0.0'
                }
              </div>
              <div className="text-sm text-gray-600">Average mood</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {new Set(moodData.map(entry => entry.date)).size}
              </div>
              <div className="text-sm text-gray-600">Days tracked</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
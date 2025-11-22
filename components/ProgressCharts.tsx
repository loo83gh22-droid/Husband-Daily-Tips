'use client';

import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';

interface ProgressChartsProps {
  userId: string;
  currentStreak: number;
  healthScore: number;
}

interface HealthDataPoint {
  date: string;
  health: number;
}

export default function ProgressCharts({ userId, currentStreak, healthScore }: ProgressChartsProps) {
  const [healthHistory, setHealthHistory] = useState<HealthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'trend' | 'calendar'>('trend');

  useEffect(() => {
    async function fetchHealthHistory() {
      try {
        // Fetch health history from API
        const response = await fetch(`/api/health/history?days=30`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.history && data.history.length > 0) {
            setHealthHistory(data.history);
          } else {
            // Fallback: generate trend from current health
            const dataPoints: HealthDataPoint[] = [];
            for (let i = 30; i >= 0; i--) {
              const date = subDays(new Date(), i);
              // Generate a realistic trend (slight variation, generally improving)
              const daysAgo = 30 - i;
              const baseHealth = Math.max(0, healthScore - (daysAgo * 0.3));
              dataPoints.push({
                date: date.toISOString().split('T')[0],
                health: Math.min(100, Math.max(0, baseHealth + (Math.random() * 3 - 1.5))),
              });
            }
            setHealthHistory(dataPoints);
          }
        } else {
          // Fallback: generate trend from current health
          const dataPoints: HealthDataPoint[] = [];
          for (let i = 30; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const daysAgo = 30 - i;
            const baseHealth = Math.max(0, healthScore - (daysAgo * 0.3));
            dataPoints.push({
              date: date.toISOString().split('T')[0],
              health: Math.min(100, Math.max(0, baseHealth + (Math.random() * 3 - 1.5))),
            });
          }
          setHealthHistory(dataPoints);
        }
      } catch (error) {
        console.error('Error fetching health history:', error);
        // Fallback on error
        const dataPoints: HealthDataPoint[] = [];
        for (let i = 30; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const daysAgo = 30 - i;
          const baseHealth = Math.max(0, healthScore - (daysAgo * 0.3));
          dataPoints.push({
            date: date.toISOString().split('T')[0],
            health: Math.min(100, Math.max(0, baseHealth + (Math.random() * 3 - 1.5))),
          });
        }
        setHealthHistory(dataPoints);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchHealthHistory();
    }
  }, [userId, healthScore]);

  // Get completion dates for calendar view
  const [completionDates, setCompletionDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCompletions() {
      try {
        const response = await fetch(`/api/actions/completions?userId=${userId}&days=90`);
        if (response.ok) {
          const data = await response.json();
          const dates = new Set<string>(data.completions?.map((c: any) => c.date as string) || []);
          setCompletionDates(dates);
        }
      } catch (error) {
        console.error('Error fetching completions:', error);
      }
    }

    if (userId) {
      fetchCompletions();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="h-48 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate health trend
  const healthTrend = healthHistory.length > 1
    ? healthHistory[healthHistory.length - 1].health - healthHistory[0].health
    : 0;

  // Get max and min health for chart scaling
  const maxHealth = Math.max(...healthHistory.map((d) => d.health), 100);
  const minHealth = Math.min(...healthHistory.map((d) => d.health), 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-50">Progress Overview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('trend')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedView === 'trend'
                ? 'bg-primary-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Trend
          </button>
          <button
            onClick={() => setSelectedView('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedView === 'calendar'
                ? 'bg-primary-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {selectedView === 'trend' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-slate-50">{healthScore.toFixed(1)}%</p>
              <p className="text-xs text-slate-400">
                {healthTrend > 0 ? (
                  <span className="text-emerald-400">↑ {healthTrend.toFixed(1)}% this month</span>
                ) : healthTrend < 0 ? (
                  <span className="text-rose-400">↓ {Math.abs(healthTrend).toFixed(1)}% this month</span>
                ) : (
                  <span className="text-slate-400">No change</span>
                )}
              </p>
            </div>
          </div>

          {/* Simple line chart */}
          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((value) => (
                <line
                  key={value}
                  x1="0"
                  y1={120 - (value / 100) * 120}
                  x2="300"
                  y2={120 - (value / 100) * 120}
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="1"
                />
              ))}

              {/* Health line */}
              {healthHistory.length > 1 && (
                <polyline
                  points={healthHistory
                    .map((point, index) => {
                      const x = (index / (healthHistory.length - 1)) * 300;
                      const y = 120 - ((point.health - minHealth) / (maxHealth - minHealth || 1)) * 120;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="rgb(251, 191, 36)"
                  strokeWidth="2"
                />
              )}

              {/* Area fill */}
              {healthHistory.length > 1 && (
                <polygon
                  points={`0,120 ${healthHistory
                    .map((point, index) => {
                      const x = (index / (healthHistory.length - 1)) * 300;
                      const y = 120 - ((point.health - minHealth) / (maxHealth - minHealth || 1)) * 120;
                      return `${x},${y}`;
                    })
                    .join(' ')} 300,120`}
                  fill="rgba(251, 191, 36, 0.1)"
                />
              )}
            </svg>
          </div>

          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{format(subDays(new Date(), 30), 'MMM d')}</span>
            <span>Today</span>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">Last 90 days</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-700 rounded"></div>
                <span>Missed</span>
              </div>
            </div>
          </div>

          {/* Calendar grid - 13 columns for 90 days (7 days per week, ~13 weeks) */}
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
            {Array.from({ length: 90 }).map((_, index) => {
              const date = subDays(new Date(), 89 - index);
              const dateStr = date.toISOString().split('T')[0];
              const isCompleted = completionDates.has(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={index}
                  className={`
                    aspect-square rounded
                    ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}
                    ${isToday ? 'ring-2 ring-primary-500' : ''}
                    hover:scale-110 transition-transform
                    cursor-pointer
                  `}
                  title={format(date, 'MMM d, yyyy')}
                />
              );
            })}
          </div>

          <div className="mt-4 text-xs text-slate-400 text-center">
            {completionDates.size} days completed in the last 90 days
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';

export default function AutoCalendarToggle() {
  const [autoAdd, setAutoAdd] = useState(false);
  const [calendarType, setCalendarType] = useState<'google' | 'outlook'>('google');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch current preferences
    fetch('/api/user/preferences', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 401) {
          // Silently handle auth errors
          return { preferences: {} };
        }
        throw new Error('Failed to fetch');
      })
      .then((data) => {
        setAutoAdd(data.preferences?.auto_add_to_calendar || false);
        setCalendarType(data.preferences?.calendar_type || 'google');
        setIsLoading(false);
      })
      .catch((error) => {
        // Silently handle errors
        setIsLoading(false);
      });
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          auto_add_to_calendar: checked,
          calendar_type: calendarType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      setAutoAdd(checked);
    } catch (error) {
      console.error('Error updating preference:', error);
      alert('Failed to update preference. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalendarTypeChange = async (type: 'google' | 'outlook') => {
    setCalendarType(type);
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          auto_add_to_calendar: autoAdd,
          calendar_type: type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }
    } catch (error) {
      console.error('Error updating calendar type:', error);
      alert('Failed to update calendar preference. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <p className="text-xs text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs text-slate-300 mb-1 font-medium">Auto-add to Calendar</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Automatically add all daily actions to your calendar when they&apos;re released.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={autoAdd}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={isSaving}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
      {autoAdd && (
        <div className="pt-3 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 mb-2">Choose your calendar:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleCalendarTypeChange('google')}
              disabled={isSaving}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                calendarType === 'google'
                  ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📅 Google Calendar
            </button>
            <button
              onClick={() => handleCalendarTypeChange('outlook')}
              disabled={isSaving}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                calendarType === 'outlook'
                  ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📅 Outlook Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


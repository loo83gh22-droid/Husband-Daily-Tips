'use client';

import { useState, useEffect } from 'react';

export default function AutoCalendarToggle() {
  const [autoAdd, setAutoAdd] = useState(false);
  const [calendarType, setCalendarType] = useState<'google' | 'outlook'>('google');
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium' | 'pro'>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [isLoadingFeedUrl, setIsLoadingFeedUrl] = useState(false);
  const [showFeedUrl, setShowFeedUrl] = useState(false);

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
        setSubscriptionTier(data.subscriptionTier || 'free');
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

  const handleDownloadAllActions = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/calendar/actions/download?days=7');
      if (!response.ok) {
        throw new Error('Failed to download calendar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'best-husband-actions-7-days.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGetFeedUrl = async () => {
    setIsLoadingFeedUrl(true);
    try {
      const response = await fetch('/api/calendar/feed-url');
      if (!response.ok) {
        const error = await response.json();
        if (error.requiresUpgrade) {
          alert('Calendar feed subscription is only available for paid users. Please upgrade to access automatic calendar syncing.');
        } else if (error.requiresEnable) {
          alert('Please enable auto-add to calendar first.');
        } else {
          throw new Error(error.error || 'Failed to get feed URL');
        }
        return;
      }

      const data = await response.json();
      setFeedUrl(data.feedUrl);
      setShowFeedUrl(true);
    } catch (error: any) {
      console.error('Error getting feed URL:', error);
      alert('Failed to get calendar feed URL. Please try again.');
    } finally {
      setIsLoadingFeedUrl(false);
    }
  };

  const copyFeedUrl = () => {
    if (feedUrl) {
      navigator.clipboard.writeText(feedUrl);
      alert('Calendar feed URL copied to clipboard!');
    }
  };

  const isPaidUser = subscriptionTier === 'premium' || subscriptionTier === 'pro';

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
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div>
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
          {isPaidUser ? (
            <div className="space-y-3">
              <div>
                <button
                  onClick={handleGetFeedUrl}
                  disabled={isLoadingFeedUrl}
                  className="w-full px-4 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default flex items-center justify-center gap-2"
                >
                  {isLoadingFeedUrl ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>🔗</span>
                      <span>Get Calendar Subscription URL</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                  Subscribe once, and all future actions will automatically sync to your calendar!
                </p>
              </div>
              {showFeedUrl && feedUrl && (
                <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-slate-300 font-medium">Your Calendar Feed URL:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={feedUrl}
                      readOnly
                      className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                    />
                    <button
                      onClick={copyFeedUrl}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-1">
                    <p><strong>Google Calendar:</strong> Settings → Add calendar → From URL → Paste URL</p>
                    <p><strong>Outlook:</strong> Add calendar → Subscribe from web → Paste URL</p>
                    <p><strong>Apple Calendar:</strong> File → New Calendar Subscription → Paste URL</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={handleDownloadAllActions}
                disabled={isDownloading}
                className="w-full px-4 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>Download Next 7 Days of Actions</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                Import the downloaded file into your {calendarType === 'google' ? 'Google' : 'Outlook'} Calendar. 
                After that, new actions will be added daily via email links.
              </p>
              <p className="text-[10px] text-primary-400 mt-2 text-center font-medium">
                💡 Upgrade to paid for automatic calendar syncing (no manual clicks needed!)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


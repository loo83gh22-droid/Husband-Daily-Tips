'use client';

import { useState, useEffect } from 'react';

interface ChallengeJoinSuccessModalProps {
  challengeName: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallengeJoinSuccessModal({
  challengeName,
  userId,
  isOpen,
  onClose,
}: ChallengeJoinSuccessModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [calendarLinks, setCalendarLinks] = useState<{
    googleCalendar?: string;
    outlookCalendar?: string;
    icalDownload?: string;
  }>({});

  // Automatically fetch calendar links when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchCalendarLinks();
    }
  }, [isOpen, userId]);

  const fetchCalendarLinks = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const response = await fetch(`${baseUrl}/api/calendar/add-to-calendar?userId=${userId}&days=7`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCalendarLinks(data);
      } else {
        // If the endpoint fails (e.g., no active challenge found), use fallback
        const fallbackUrl = `${baseUrl}/api/calendar/actions/download?days=7&userId=${userId}`;
        setCalendarLinks({
          icalDownload: fallbackUrl,
        });
      }
    } catch (error) {
      console.error('Error fetching calendar links:', error);
      // Set fallback URL even on error
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const fallbackUrl = `${baseUrl}/api/calendar/actions/download?days=7&userId=${userId}`;
      setCalendarLinks({
        icalDownload: fallbackUrl,
      });
    }
  };

  const handleAddToCalendar = async (provider: 'google' | 'outlook') => {
    setIsAdding(true);
    try {
      // If we don't have links yet, fetch them
      if (!calendarLinks.googleCalendar && !calendarLinks.outlookCalendar) {
        await fetchCalendarLinks();
      }

      const url = provider === 'google' 
        ? calendarLinks.googleCalendar 
        : calendarLinks.outlookCalendar;

      if (url) {
        // Open calendar in new window
        window.open(url, '_blank');
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        alert('Calendar link not available. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('Failed to add to calendar. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDownloadiCal = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const downloadUrl = calendarLinks.icalDownload || `${baseUrl}/api/calendar/actions/download?days=7&userId=${userId}`;
      
      // Retry logic: if challenge was just joined, wait a moment for DB to sync
      let retries = 3;
      let lastError: Error | null = null;
      
      while (retries > 0) {
        try {
          // Use fetch to properly handle errors
          const response = await fetch(downloadUrl, {
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            const errorMessage = errorData.error || `Server error: ${response.status}`;
            
            // If it's a 404 and we have retries left, wait and retry (challenge might not be synced yet)
            if (response.status === 404 && retries > 1) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
              retries--;
              continue;
            }
            
            throw new Error(errorMessage);
          }

          // Check if response is actually a calendar file (starts with BEGIN:VCALENDAR)
          const text = await response.text();
          if (!text.includes('BEGIN:VCALENDAR')) {
            // If it's JSON error, parse it
            try {
              const errorData = JSON.parse(text);
              throw new Error(errorData.error || 'Invalid calendar file');
            } catch {
              throw new Error('Invalid calendar file received');
            }
          }

          // Get the blob and create download
          const blob = new Blob([text], { type: 'text/calendar' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '7-day-event-actions.ics';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setTimeout(() => {
            onClose();
          }, 500);
          return; // Success, exit function
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
        }
      }
      
      // If we get here, all retries failed
      throw lastError || new Error('Failed to download calendar after multiple attempts');
    } catch (error) {
      console.error('Error downloading calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to download calendar: ${errorMessage}. Please try again in a moment.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-primary-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">
            Boom. You&apos;re In.
          </h2>
          <p className="text-slate-300 text-lg">
            7 days. 7 chances to level up. Your wife notices in 3... 2... 1...
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Welcome to <strong className="text-primary-400">{challengeName}</strong>
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-primary-400">Here&apos;s the deal:</strong> We&apos;ve locked in 7 actions, one for each day. These aren&apos;t random—they&apos;re picked for you based on your survey.
          </p>
          <p className="text-xs text-slate-400">
            Want to be extra smart? Add them to your calendar now. Planning ahead = actually doing it. Pre-assigned actions take priority over the daily algorithm, so you&apos;re locked and loaded.
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-slate-300 mb-2 text-center">
            Add all 7 days to your calendar automatically:
          </div>
          
          <button
            onClick={() => handleAddToCalendar('google')}
            disabled={isAdding}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <>
                <span className="animate-spin">⏳</span>
                Adding...
              </>
            ) : (
              <>
                📅 Add to Google Calendar
              </>
            )}
          </button>

          <button
            onClick={() => handleAddToCalendar('outlook')}
            disabled={isAdding}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <>
                <span className="animate-spin">⏳</span>
                Adding...
              </>
            ) : (
              <>
                📅 Add to Outlook Calendar
              </>
            )}
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="px-3 text-xs text-slate-500">OR</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <button
            onClick={handleDownloadiCal}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            📥 Download iCal File (for Apple Calendar)
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            I'll Do It Later
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          You'll also receive an email with all 7 days of actions shortly!
        </p>
      </div>
    </div>
  );
}


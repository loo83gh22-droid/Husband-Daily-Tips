'use client';

import { useState } from 'react';

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
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

  const handleDownloadCalendar = async (days: number) => {
    setIsDownloading(true);
    try {
      const url = `${baseUrl}/api/calendar/actions/download?days=${days}&userId=${userId}`;
      window.location.href = url;
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-primary-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">
            Challenge Joined!
          </h2>
          <p className="text-slate-300">
            You've successfully joined the <strong className="text-primary-400">{challengeName}</strong> challenge!
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-300 mb-4">
            <strong className="text-primary-400">🎯 7 days of personalized actions</strong> have been assigned to your account!
          </p>
          <p className="text-xs text-slate-400">
            Download them to your calendar to plan ahead and lock in your commitment. Pre-assigned actions take precedence over the daily algorithm.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleDownloadCalendar(7)}
            disabled={isDownloading}
            className="w-full bg-primary-500 hover:bg-primary-400 text-slate-950 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <span className="animate-spin">⏳</span>
                Downloading...
              </>
            ) : (
              <>
                📅 Download 7 Days to Calendar
              </>
            )}
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


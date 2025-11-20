'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  username: string | null;
  years_married: number | null;
  post_anonymously: boolean;
  name: string | null;
}

interface AccountProfileFormProps {
  initialProfile: UserProfile;
  email: string;
}

export default function AccountProfileForm({ initialProfile, email }: AccountProfileFormProps) {
  const [username, setUsername] = useState(initialProfile.username || '');
  const [yearsMarried, setYearsMarried] = useState(initialProfile.years_married?.toString() || '');
  const [postAnonymously, setPostAnonymously] = useState(initialProfile.post_anonymously || false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Validate username if provided
      if (username.trim() && (username.length < 3 || username.length > 20)) {
        setSaveMessage({ type: 'error', text: 'Username must be between 3 and 20 characters' });
        setIsSaving(false);
        return;
      }

      // Validate years married if provided
      const years = yearsMarried.trim() ? parseInt(yearsMarried) : null;
      if (years !== null && (years < 0 || years > 100)) {
        setSaveMessage({ type: 'error', text: 'Years married must be between 0 and 100' });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim() || null,
          years_married: years,
          post_anonymously: postAnonymously,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
        <p className="text-slate-200">{email}</p>
        <p className="text-xs text-slate-500 mt-1">
          Managed by Auth0. Update your email in your Auth0 account settings.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
        <p className="text-slate-200">{initialProfile.name || 'Not set'}</p>
        <p className="text-xs text-slate-500 mt-1">
          Your name from Auth0. This is used to extract your first name for Team Wins if you don&apos;t set a username.
        </p>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Team Wins Profile</h3>
        <p className="text-sm text-slate-400 mb-6">
          Control how your name appears when you share wins to Team Wins. Your email is never shown.
        </p>

        <div className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username (Optional)
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a display name"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
              maxLength={20}
            />
            <p className="text-xs text-slate-500 mt-1">
              If set, this will be shown instead of your first name in Team Wins. Leave empty to use your first name.
            </p>
          </div>

          {/* Years Married */}
          <div>
            <label htmlFor="years_married" className="block text-sm font-medium text-slate-300 mb-2">
              Years Married
            </label>
            <input
              type="number"
              id="years_married"
              value={yearsMarried}
              onChange={(e) => setYearsMarried(e.target.value)}
              placeholder="e.g., 5"
              min="0"
              max="100"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">
              This can be shown on your Team Wins posts to help others relate to your experience.
            </p>
          </div>

          {/* Post Anonymously */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="post_anonymously"
              checked={postAnonymously}
              onChange={(e) => setPostAnonymously(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500/50 focus:ring-2"
            />
            <div className="flex-1">
              <label htmlFor="post_anonymously" className="block text-sm font-medium text-slate-300 mb-1">
                Post Anonymously to Team Wins
              </label>
              <p className="text-xs text-slate-500">
                When enabled, your Team Wins posts will show as &quot;Anonymous&quot; instead of your name or username.
                Your years married will also be hidden.
              </p>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={`p-3 rounded-lg ${
                saveMessage.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}
            >
              <p className="text-sm">{saveMessage.text}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}


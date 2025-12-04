'use client';

import { useState, useEffect } from 'react';

interface EmailPreferences {
  daily_actions: boolean;
  surveys: boolean;
  marketing: boolean;
  updates: boolean;
  challenges: boolean;
  trial_reminders: boolean;
}

interface EmailPreferencesFormProps {
  initialPreferences?: EmailPreferences | null;
}

export default function EmailPreferencesForm({
  initialPreferences,
}: EmailPreferencesFormProps) {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    daily_actions: true,
    surveys: true,
    marketing: true,
    updates: true,
    challenges: true,
    trial_reminders: true,
    ...initialPreferences,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialPreferences) {
      setPreferences({
        daily_actions: true,
        surveys: true,
        marketing: true,
        updates: true,
        challenges: true,
        trial_reminders: true,
        ...initialPreferences,
      });
    }
  }, [initialPreferences]);

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update email preferences');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const emailTypeLabels: Record<keyof EmailPreferences, { label: string; description: string }> = {
    daily_actions: {
      label: 'Daily Action Emails',
      description: 'Receive your daily personalized action at 12 noon in your timezone',
    },
    surveys: {
      label: 'Survey Emails',
      description: 'Receive invitations to complete relationship surveys (7-day, 30-day, 90-day)',
    },
    marketing: {
      label: 'Marketing & Promotional Emails',
      description: 'Receive special offers, tips, and relationship content',
    },
    updates: {
      label: 'Product Updates',
      description: 'Receive notifications about new features and improvements',
    },
    challenges: {
      label: 'Challenge & Event Emails',
      description: 'Receive notifications about special challenges and relationship events',
    },
    trial_reminders: {
      label: 'Trial Reminders',
      description: 'Receive reminders about your free trial expiration',
    },
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-50 mb-2">Email Preferences</h2>
        <p className="text-sm text-slate-400">
          Choose which types of emails you'd like to receive. You can change these at any time.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-300 text-sm mb-4">
          Email preferences saved successfully!
        </div>
      )}

      <div className="space-y-4 mb-6">
        {(Object.keys(emailTypeLabels) as Array<keyof EmailPreferences>).map((key) => {
          const { label, description } = emailTypeLabels[key];
          return (
            <div
              key={key}
              className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
            >
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={() => handleToggle(key)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-2 focus:ring-primary-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-200">
                      {label}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1">
                      {description}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full md:w-auto px-6 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Email Preferences'}
      </button>
    </div>
  );
}


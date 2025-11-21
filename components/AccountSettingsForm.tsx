'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  username: string | null;
  profile_picture: string | null;
  post_anonymously: boolean;
  timezone: string;
  wedding_date: string | null;
}

interface AccountSettingsFormProps {
  initialData: UserProfile;
}

export default function AccountSettingsForm({ initialData }: AccountSettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: initialData.username || '',
    post_anonymously: initialData.post_anonymously || false,
    timezone: initialData.timezone || 'America/New_York',
    wedding_date: initialData.wedding_date || '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(initialData.profile_picture);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Common timezones
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
    { value: 'America/Toronto', label: 'Toronto (ET)' },
    { value: 'America/Vancouver', label: 'Vancouver (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setError(null);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // First, upload profile picture if selected
      let pictureUrl = profilePictureUrl;
      if (profilePicture) {
        const formData = new FormData();
        formData.append('file', profilePicture);
        
        const uploadResponse = await fetch('/api/user/upload-profile-picture', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload profile picture');
        }

        const uploadData = await uploadResponse.json();
        pictureUrl = uploadData.url;
      }

      // Then update profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username || null,
          post_anonymously: formData.post_anonymously,
          timezone: formData.timezone,
          wedding_date: formData.wedding_date || null,
          profile_picture: pictureUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-300 text-sm">
          Settings saved successfully!
        </div>
      )}

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Choose a username (optional)"
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-slate-500">
          This will be displayed in Team Wins instead of your email address
        </p>
      </div>

      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          {profilePictureUrl && (
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700">
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              id="profile-picture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="profile-picture"
              className="inline-block px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-700 cursor-pointer transition-colors"
            >
              {profilePictureUrl ? 'Change Picture' : 'Upload Picture'}
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Upload your favorite picture of you and your partner (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Anonymity Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.post_anonymously}
            onChange={(e) => setFormData({ ...formData, post_anonymously: e.target.checked })}
            className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-2 focus:ring-primary-500"
          />
          <div>
            <span className="block text-sm font-medium text-slate-300">
              Post Anonymously in Team Wins
            </span>
            <span className="block text-xs text-slate-500 mt-1">
              When enabled, your posts in Team Wins will show as "Anonymous" instead of your username
            </span>
          </div>
        </label>
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-slate-300 mb-2">
          Timezone
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Used for scheduling your daily email at 7 PM in your timezone
        </p>
      </div>

      {/* Wedding Date */}
      <div>
        <label htmlFor="wedding_date" className="block text-sm font-medium text-slate-300 mb-2">
          Wedding Date
        </label>
        <input
          type="date"
          id="wedding_date"
          value={formData.wedding_date}
          onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-slate-500">
          Used to calculate and display years married in Team Wins
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full md:w-auto px-6 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}


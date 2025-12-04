# Email System Documentation

## Overview

The Best Husband Ever app sends several types of emails to users. This document explains how emails are sent, how users can manage their preferences, and how to add new email types.

## Email Types

### 1. Daily Action Emails (`daily_actions`)
- **When:** Every day at 12 noon in the user's timezone
- **Purpose:** Deliver the next day's personalized action
- **Frequency:** Daily
- **Can unsubscribe:** Yes
- **Endpoint:** `/api/cron/send-daily-emails` → `/api/email/send-daily-action`

### 2. Survey Emails (`surveys`)
- **When:** 
  - 7 days after signup
  - 30 days after signup
  - 90 days after signup (NPS survey)
- **Purpose:** Collect feedback and measure relationship improvement
- **Frequency:** Sporadic (based on user signup date)
- **Can unsubscribe:** Yes
- **Endpoints:** 
  - `/api/cron/send-7-day-survey-email`
  - `/api/cron/send-30-and-90-day-survey-emails`

### 3. Marketing & Promotional Emails (`marketing`)
- **When:** Special campaigns, offers, tips
- **Purpose:** Engagement and conversion
- **Frequency:** Sporadic (manual triggers)
- **Can unsubscribe:** Yes
- **Endpoint:** Custom (to be implemented)

### 4. Product Updates (`updates`)
- **When:** New features, improvements, announcements
- **Purpose:** Keep users informed about the product
- **Frequency:** Sporadic (as needed)
- **Can unsubscribe:** Yes
- **Endpoint:** Custom (to be implemented)

### 5. Challenge & Event Emails (`challenges`)
- **When:** User joins a challenge or special event
- **Purpose:** Notify about challenge actions and events
- **Frequency:** Sporadic (when user joins)
- **Can unsubscribe:** Yes
- **Endpoint:** `/api/challenges/join`

### 6. Trial Reminders (`trial_reminders`)
- **When:** 2 days before trial expiration
- **Purpose:** Remind users to subscribe before trial ends
- **Frequency:** Sporadic (once per trial)
- **Can unsubscribe:** Yes
- **Endpoint:** `/api/cron/check-expiring-trials`

### 7. Welcome/Subscription Confirmation (`system`)
- **When:** Immediately after successful subscription
- **Purpose:** Confirm subscription and provide onboarding info
- **Frequency:** One-time
- **Can unsubscribe:** No (transactional email)
- **Endpoint:** `/api/webhooks/stripe` (checkout.session.completed event)

## How Sporadic Emails Work

Sporadic emails are sent via **cron jobs** that run on a schedule:

1. **Cron jobs** check the database for eligible users
2. **Eligibility** is determined by:
   - User signup date (for surveys)
   - Trial expiration date (for trial reminders)
   - Challenge join date (for challenge emails)
   - Manual triggers (for marketing/updates)
3. **Email preferences** are checked before sending
4. **Emails are sent** only if user has that preference enabled

### Example: Survey Emails

```typescript
// Cron job runs daily
// Checks: user_follow_up_surveys table for eligible surveys
// Filters: Only users with surveys.enabled = true
// Sends: Email invitation to complete survey
```

### Example: Trial Reminders

```typescript
// Cron job runs daily
// Checks: users table for trials expiring in 2 days
// Filters: Only users with trial_reminders enabled
// Sends: Reminder email with subscription link
```

## Email Preferences System

### Database Structure

Email preferences are stored in the `users.email_preferences` JSONB column:

```json
{
  "daily_actions": true,
  "surveys": true,
  "marketing": true,
  "updates": true,
  "challenges": true,
  "trial_reminders": true
}
```

### Checking Preferences

Use the `shouldSendEmail()` helper function:

```typescript
import { shouldSendEmail } from '@/lib/email-preferences';

const canSend = await shouldSendEmail(userId, 'surveys');
if (canSend) {
  // Send email
}
```

### Database Function

A PostgreSQL function `should_send_email(user_id, email_type)` is available for efficient checking:

```sql
SELECT should_send_email('user-uuid', 'surveys');
-- Returns: true or false
```

## Unsubscribe Functionality

### How It Works

1. **Unsubscribe links** are included in all emails (except transactional)
2. **Token-based** - No login required
3. **Token format:** `base64(user_id:email_type:timestamp)`
4. **Token expires:** 90 days
5. **Endpoint:** `/api/email/unsubscribe?token=xxx&type=xxx`

### Adding Unsubscribe Links to Emails

```typescript
import { generateUnsubscribeUrl } from '@/lib/email-preferences';

const unsubscribeUrl = generateUnsubscribeUrl(userId, 'surveys');

// In email HTML:
<a href="${unsubscribeUrl}">Unsubscribe from survey emails</a>
```

### User Management

Users can manage all email preferences in **Account Settings** (`/dashboard/account`):
- Toggle each email type on/off
- Changes take effect immediately
- Preferences are saved to database

## Adding New Email Types

### Step 1: Update Database Migration

Add the new type to the default preferences in `136_add_email_preferences.sql`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{
  ...
  "new_type": true
}'::jsonb;
```

### Step 2: Update TypeScript Types

Add to `lib/email-preferences.ts`:

```typescript
export type EmailType =
  | ...
  | 'new_type';
```

### Step 3: Update UI Component

Add to `components/EmailPreferencesForm.tsx`:

```typescript
const emailTypeLabels: Record<keyof EmailPreferences, { label: string; description: string }> = {
  ...
  new_type: {
    label: 'New Type Emails',
    description: 'Description of what these emails contain',
  },
};
```

### Step 4: Check Preferences Before Sending

```typescript
import { shouldSendEmail, generateUnsubscribeUrl } from '@/lib/email-preferences';

// Before sending
const canSend = await shouldSendEmail(userId, 'new_type');
if (!canSend) {
  return; // Don't send
}

// In email HTML
const unsubscribeUrl = generateUnsubscribeUrl(userId, 'new_type');
```

## Best Practices

1. **Always check preferences** before sending emails
2. **Include unsubscribe links** in all non-transactional emails
3. **Respect user choices** - if they unsubscribe, don't send
4. **Use the helper functions** - don't manually check preferences
5. **Test unsubscribe flow** - ensure tokens work correctly
6. **Log email sends** - track what's being sent for debugging

## Email Sending Checklist

Before sending any email:

- [ ] Check if user has preference enabled
- [ ] Include unsubscribe link (if not transactional)
- [ ] Use correct email type constant
- [ ] Handle errors gracefully
- [ ] Log email send for debugging
- [ ] Test with different preference combinations

## Future Enhancements

- [ ] Email digest option (weekly summary instead of daily)
- [ ] Frequency preferences (daily vs weekly for some types)
- [ ] Time-of-day preferences (when to receive emails)
- [ ] Email templates system
- [ ] A/B testing for email content
- [ ] Email analytics and tracking


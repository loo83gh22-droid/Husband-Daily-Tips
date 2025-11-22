# Testing Calendar Feed Subscription

## Prerequisites

1. **Set your subscription tier to 'premium' or 'pro'** (for testing):
   - Go to Supabase SQL Editor
   - Run: `UPDATE users SET subscription_tier = 'premium' WHERE email = 'your-email@example.com';`

2. **Optional: Set CALENDAR_FEED_SECRET** (for production security):
   - Add to `.env.local`: `CALENDAR_FEED_SECRET=your-secret-here`
   - Generate with: `openssl rand -hex 32`

## Testing Steps

### Step 1: Enable Auto-Add to Calendar
1. Go to your dashboard: `http://localhost:3000/dashboard`
2. Find the "Auto-add to Calendar" toggle
3. Turn it ON
4. Select your calendar type (Google or Outlook)

### Step 2: Get Calendar Feed URL (Paid Users Only)
1. Click "Get Calendar Subscription URL" button
2. You should see a feed URL appear
3. Copy the URL

### Step 3: Subscribe in Calendar App

**For Google Calendar:**
1. Open Google Calendar (calendar.google.com)
2. Click the "+" next to "Other calendars" (left sidebar)
3. Select "From URL"
4. Paste the feed URL
5. Click "Add calendar"
6. The calendar should appear and sync automatically

**For Outlook:**
1. Open Outlook Calendar (outlook.live.com/calendar)
2. Click "Add calendar" → "Subscribe from web"
3. Paste the feed URL
4. Click "Import"

**For Apple Calendar:**
1. Open Calendar app
2. Go to File → New Calendar Subscription
3. Paste the feed URL
4. Click "Subscribe"

### Step 4: Verify It Works
1. Check your calendar - you should see events for the next 90 days
2. Events should update automatically when new actions are assigned
3. The feed refreshes every hour (as configured)

## Testing the Feed URL Directly

You can also test the feed URL directly in a browser:
- Open the feed URL in a new tab
- You should see an iCal file download or display
- The file should contain calendar events

## Troubleshooting

**"Calendar feed subscription is only available for paid users"**
- Make sure your subscription_tier is set to 'premium' or 'pro' in the database

**"Please enable auto-add to calendar first"**
- Make sure the toggle is ON before getting the feed URL

**Feed URL doesn't work**
- Check that CALENDAR_FEED_SECRET is set (or using default)
- Verify the token in the URL matches what the feed endpoint expects
- Check browser console for errors

**Calendar doesn't sync**
- Some calendar apps cache feeds - wait a few minutes
- Try refreshing the calendar subscription
- Check that the feed URL is accessible (not blocked by firewall)


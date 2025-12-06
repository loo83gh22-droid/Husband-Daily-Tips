# Google Analytics Setup Guide

## Overview

Google Analytics is **recommended** for tracking user behavior, conversion rates, and understanding how users interact with your application. It's particularly useful for:

- **Marketing**: Track which sources bring users (Facebook, organic search, direct, etc.)
- **Conversion Funnel**: See where users drop off in the signup → subscription flow
- **Feature Usage**: Understand which actions/features are most popular
- **Performance**: Monitor page load times and user engagement
- **Retention**: Track user retention and engagement over time

## Setup Instructions

### 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring" or "Admin" → "Create Property"
4. Fill in:
   - Property name: "Best Husband Ever"
   - Time zone: Your timezone
   - Currency: USD (or your preference)
5. Click "Next" and fill in business details
6. Click "Create" and accept terms

### 2. Get Your Measurement ID

1. In your new property, go to **Admin** (gear icon at bottom left)
2. Under "Property" column, click **Data Streams**
3. Click **Add stream** → **Web**
4. Enter:
   - Website URL: `https://www.besthusbandever.com`
   - Stream name: "Best Husband Ever Production"
5. Click **Create stream**
6. **Copy your Measurement ID** (starts with `G-`) - You'll see it on the next screen
   - It will look like: `G-XXXXXXXXXX`
   - **Save this - you'll need it for Vercel!**

### 3. Add to Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

And add to **Vercel** environment variables:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - Key: `NEXT_PUBLIC_GA_ID`
   - Value: `G-XXXXXXXXXX` (your Measurement ID)
   - Environment: Production, Preview, Development (or just Production)
4. Click **Save**

### 4. Deploy

The code is already set up! Just:

1. Commit and push your changes
2. Vercel will automatically deploy
3. Google Analytics will start tracking

## What Gets Tracked

The implementation automatically tracks:

- ✅ **Page views**: Every page navigation
- ✅ **Page paths**: Which pages users visit
- ✅ **User sessions**: How long users stay
- ✅ **Traffic sources**: Where users come from

## Custom Event Tracking (Optional)

You can add custom event tracking for important actions. For example, to track action completions:

```typescript
// In your action completion handler
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'action_completed', {
    action_name: action.title,
    category: action.category,
  });
}
```

## Privacy Considerations

### GDPR/Privacy Compliance

If you have users in the EU, you may need:

1. **Cookie Consent Banner**: Google Analytics uses cookies
2. **Privacy Policy**: Update to mention analytics
3. **IP Anonymization**: Already enabled by default in GA4

To add a cookie consent banner, consider:
- [Cookie Consent](https://cookieconsent.insites.com/)
- [Cookiebot](https://www.cookiebot.com/)
- Or build your own

### Disable Analytics in Development

The component already checks for the environment variable, so analytics won't run in development if you don't set `NEXT_PUBLIC_GA_ID` locally.

## Testing

1. **Verify Installation**:
   - Deploy to production
   - Visit your site
   - Go to Google Analytics → Reports → Realtime
   - You should see your visit appear within 30 seconds

2. **Check in Browser**:
   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "collect" or "analytics"
   - You should see requests to `google-analytics.com`

## Key Metrics to Monitor

### Conversion Goals

Set up these goals in Google Analytics:

1. **Signup**: Event when user completes signup
2. **Survey Completion**: Event when user completes survey
3. **Subscription**: Event when user subscribes to premium
4. **Action Completion**: Track daily action completions

### Important Reports

- **Acquisition**: Where are users coming from?
- **Behavior**: Which pages are most popular?
- **Conversion**: Signup → Survey → Subscription funnel
- **Retention**: Are users coming back?

## Alternatives

If you prefer privacy-focused analytics, consider:

- **Plausible Analytics**: Privacy-friendly, GDPR compliant, no cookies
- **PostHog**: Open source, privacy-focused, includes feature flags
- **Vercel Analytics**: Built into Vercel, simple and privacy-focused

## Troubleshooting

**Analytics not working?**
- Check that `NEXT_PUBLIC_GA_ID` is set in Vercel
- Verify the Measurement ID starts with `G-`
- Check browser console for errors
- Make sure ad blockers aren't blocking it

**Not seeing data?**
- GA4 has a 24-48 hour delay for some reports
- Use "Realtime" reports for immediate data
- Check that cookies are enabled

## Next Steps

1. ✅ Set up Google Analytics account
2. ✅ Add Measurement ID to environment variables
3. ✅ Deploy and verify tracking works
4. ⬜ Set up conversion goals (signups, subscriptions)
5. ⬜ Set up custom events for key actions
6. ⬜ Add cookie consent banner (if needed for GDPR)
7. ⬜ Monitor key metrics weekly


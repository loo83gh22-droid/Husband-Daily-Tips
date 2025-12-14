# How to Set Up Facebook Conversion Events

## Step-by-Step Guide

### Step 1: Access Events Manager

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Click on **"Events Manager"** in the left sidebar
   - If you don't see it, click the menu icon (☰) and look for "Events Manager"
3. Click on your Pixel (the one we just set up)

### Step 2: Go to Events Tab

1. In your Pixel dashboard, click on the **"Events"** tab at the top
2. You should see a list of events being tracked
3. You'll likely see "PageView" events already showing up

### Step 3: Set Up CompleteRegistration Event (Signups)

#### Option A: Use Standard Event (Easier - Recommended)

1. In the Events tab, look for **"Test Events"** or **"Events"** section
2. Click **"Create Event"** or **"Add Event"** button
3. Select **"Use Standard Event"**
4. Choose **"CompleteRegistration"** from the dropdown
5. Click **"Continue"** or **"Create"**

The event is already being tracked automatically by your code! You just need to verify it's set up in Events Manager.

#### Option B: Verify Event is Firing

1. Go to **"Test Events"** tab in Events Manager
2. Visit your website and sign up for a new account
3. You should see "CompleteRegistration" appear in the Test Events feed
4. If you see it, the event is working! ✅

### Step 4: Set Up Purchase Event (Subscriptions)

#### Option A: Use Standard Event

1. In the Events tab, click **"Create Event"** or **"Add Event"**
2. Select **"Use Standard Event"**
3. Choose **"Purchase"** from the dropdown
4. Click **"Continue"** or **"Create"**

Again, this is already being tracked by your code - you're just verifying it's set up.

#### Option B: Verify Event is Firing

1. Go to **"Test Events"** tab
2. Complete a subscription purchase on your site
3. You should see "Purchase" appear in the Test Events feed
4. If you see it, the event is working! ✅

---

## Alternative: Set Up Custom Conversions (More Control)

If you want more control over what counts as a conversion:

### Step 1: Go to Custom Conversions

1. In Events Manager, click on **"Custom Conversions"** in the left sidebar
2. Click **"Create Custom Conversion"**

### Step 2: Create Signup Conversion

1. **Name**: "User Signup" or "Complete Registration"
2. **Event**: Select "CompleteRegistration"
3. **URL Contains**: Leave empty (or add `/dashboard` if you want to be specific)
4. **Category**: Select "Lead" or "Complete Registration"
5. **Value**: Leave as "No value" (or set a value if you want to track signup value)
6. Click **"Create"**

### Step 3: Create Purchase Conversion

1. Click **"Create Custom Conversion"** again
2. **Name**: "Subscription Purchase" or "Premium Upgrade"
3. **Event**: Select "Purchase"
4. **URL Contains**: Leave empty (or add `/dashboard/subscription` if you want to be specific)
5. **Category**: Select "Purchase"
6. **Value**: Select "Use event value" (this will use the price from your Purchase event)
7. Click **"Create"**

---

## Verify Events Are Working

### Method 1: Test Events Tab (Real-time)

1. Go to Events Manager → Your Pixel → **"Test Events"** tab
2. Keep this tab open
3. In another tab, visit your website
4. You should see events appearing in real-time:
   - **PageView** - When you visit any page
   - **CompleteRegistration** - When you sign up
   - **Purchase** - When you subscribe

### Method 2: Use Facebook Pixel Helper

1. Install [Facebook Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visit your website
3. Click the extension icon
4. You should see:
   - Your Pixel ID
   - Events being fired (PageView, CompleteRegistration, Purchase)

### Method 3: Check Events Tab

1. Go to Events Manager → Your Pixel → **"Events"** tab
2. You should see a list of events with counts
3. Look for:
   - **PageView** - Should have counts
   - **CompleteRegistration** - Should appear after signups
   - **Purchase** - Should appear after purchases

---

## What Your Code Already Does

Your code automatically tracks:
- ✅ **PageView** - On every page load (already working)
- ✅ **CompleteRegistration** - When users sign up (via AnalyticsTracker)
- ✅ **Purchase** - When users subscribe (via AnalyticsTracker)

So you don't need to manually set up the events - they're already being sent! You just need to:
1. Verify they're showing up in Events Manager
2. Optionally create Custom Conversions for better reporting

---

## Quick Checklist

- [ ] Go to Events Manager → Your Pixel
- [ ] Check "Test Events" tab - visit your site and verify events appear
- [ ] (Optional) Create Custom Conversions for better tracking
- [ ] Verify events show up in "Events" tab with counts

---

## Troubleshooting

### Events Not Showing Up?

1. **Check Pixel is installed**: Use Pixel Helper extension
2. **Check browser console**: Look for errors
3. **Disable ad blockers**: They might block tracking
4. **Test in incognito mode**: Some extensions interfere
5. **Wait a few minutes**: Events can take 1-2 minutes to appear

### CompleteRegistration Not Firing?

1. Make sure you're actually completing a signup (not just visiting)
2. Check that `trackFacebookSignup()` is being called in your signup flow
3. Verify in browser DevTools → Network tab for Facebook requests

### Purchase Not Firing?

1. Make sure you're completing an actual subscription
2. Check that `trackFacebookPurchase()` is being called
3. Verify the price is being passed correctly

---

## Next Steps After Setting Up Events

Once events are verified:

1. **Create your first ad campaign**
2. **Set optimization goal**: Choose "Conversions" and select "CompleteRegistration" or "Purchase"
3. **Facebook will optimize**: It will show your ads to people likely to sign up or purchase
4. **Monitor performance**: Check Events Manager regularly to see conversions

---

**Need more help?** Check Facebook's official guide: https://www.facebook.com/business/help/952354392762838


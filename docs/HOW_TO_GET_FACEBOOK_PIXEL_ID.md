# How to Get Your Facebook Pixel ID

## Step-by-Step Guide

### Step 1: Access Facebook Events Manager

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. If you don't have a Business Manager account, you'll need to create one (it's free)
3. Once logged in, click on **"Events Manager"** in the left sidebar
   - If you don't see it, click the menu icon (☰) and look for "Events Manager"

### Step 2: Create a New Pixel

1. In Events Manager, you'll see a section called **"Data Sources"** or **"Pixels"**
2. Click the **"+ Add"** or **"Connect Data Sources"** button
3. Select **"Web"** as your data source type
4. Click **"Facebook Pixel"**
5. Click **"Connect"**

### Step 3: Name Your Pixel

1. Enter a name for your pixel (e.g., "Best Husband Ever Pixel")
2. Enter your website URL: `https://www.besthusbandever.com`
3. Click **"Continue"**

### Step 4: Get Your Pixel ID

1. After creating the pixel, you'll see your **Pixel ID**
   - It's a 15-16 digit number (e.g., `1234567890123456`)
   - You'll see it displayed prominently on the screen
2. **Copy this number** - you'll need it for Vercel

### Step 5: Add to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **Best Husband Ever**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Key**: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
   - **Value**: Your Pixel ID (the 15-16 digit number)
   - **Environment**: Select all (Production, Preview, Development) or just Production
6. Click **"Save"**
7. **Redeploy** your site (or wait for auto-deploy)

---

## Alternative: If You Already Have a Pixel

If you've created a pixel before:

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Click on **"Data Sources"** in the left sidebar
3. Find your pixel in the list
4. Click on it
5. Your **Pixel ID** is displayed at the top of the page
6. Copy it and add to Vercel as described above

---

## Verify Your Pixel is Working

### Method 1: Facebook Pixel Helper (Recommended)

1. Install the [Facebook Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visit your website: `https://www.besthusbandever.com`
3. Click the extension icon
4. You should see:
   - ✅ "Facebook Pixel ID: [your ID]"
   - ✅ "PageView" event fired
5. If you see errors, check the troubleshooting section below

### Method 2: Facebook Events Manager

1. Go to Events Manager
2. Click on your pixel
3. Go to **"Test Events"** tab
4. Visit your website in another tab
5. You should see events appearing in real-time

### Method 3: Browser DevTools

1. Visit your website
2. Open DevTools (F12)
3. Go to **Network** tab
4. Filter by "facebook" or "fbevents"
5. You should see requests to `facebook.com/tr`
6. Check the request URL - it should contain your Pixel ID

---

## Troubleshooting

### Pixel Not Showing Up

**Problem**: Pixel Helper shows "No pixel detected"

**Solutions**:
1. Make sure you added `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` to Vercel
2. Make sure you redeployed after adding the environment variable
3. Clear your browser cache
4. Check that the environment variable name is exactly: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
5. Verify the Pixel ID is correct (15-16 digits, no spaces)

### Events Not Firing

**Problem**: Pixel is detected but events aren't showing

**Solutions**:
1. Check browser console for errors
2. Make sure ad blockers aren't blocking Facebook scripts
3. Try in incognito mode
4. Verify the Pixel ID in your code matches Events Manager

### Can't Access Events Manager

**Problem**: Don't see Events Manager option

**Solutions**:
1. Make sure you're logged into Facebook Business Manager (not personal account)
2. You may need to create a Business Manager account first
3. Go to [business.facebook.com](https://business.facebook.com) and create an account

---

## Quick Reference

- **Facebook Business Manager**: https://business.facebook.com/
- **Events Manager**: https://business.facebook.com/events_manager2
- **Pixel Helper Extension**: [Chrome Web Store](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- **Facebook Ads Help**: https://www.facebook.com/business/help

---

## What Your Pixel ID Looks Like

Your Pixel ID is a **15-16 digit number**, for example:
- `1234567890123456`
- `9876543210987654`

It's **NOT**:
- A URL
- A code with letters
- A measurement ID (those start with `G-`)

---

## Next Steps After Getting Your Pixel ID

1. ✅ Add to Vercel environment variables
2. ✅ Redeploy your site
3. ✅ Verify Pixel is working (use Pixel Helper)
4. ✅ Set up conversion events in Events Manager (optional but recommended)
5. ✅ Create your first ad campaign

---

## Setting Up Conversion Events (Optional but Recommended)

After your Pixel is working, you can set up conversion events:

1. Go to Events Manager → Your Pixel → **"Settings"**
2. Scroll to **"Conversions API"** (optional, for advanced tracking)
3. Or go to **"Events"** tab to see events being tracked
4. You can create custom conversions:
   - **CompleteRegistration**: When someone signs up
   - **Purchase**: When someone subscribes

The code already tracks these automatically, but setting them up in Events Manager helps Facebook optimize your ads better.

---

**Need more help?** Check Facebook's official guide: https://www.facebook.com/business/help/952354392762838


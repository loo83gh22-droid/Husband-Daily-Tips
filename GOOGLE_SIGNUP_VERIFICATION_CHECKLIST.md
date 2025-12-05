# Google Signup Verification Checklist

## ✅ What We've Fixed

1. **Updated Auth0 Callback URLs** - Added both www and non-www versions:
   - `https://www.besthusbandever.com/api/auth/callback`
   - `https://besthusbandever.com/api/auth/callback`

2. **Updated Auth0 Web Origins** - Added both www and non-www versions:
   - `https://www.besthusbandever.com`
   - `https://besthusbandever.com`

3. **Updated Auth0 Logout URLs** - Added both www and non-www versions:
   - `https://www.besthusbandever.com`
   - `https://besthusbandever.com`

4. **Updated Signup Buttons** - Added `returnTo=/dashboard` parameter so users are redirected correctly after login

## 🔍 What We Need to Verify (In Auth0 Dashboard)

### Step 1: Verify Google Connection is Enabled for Your App

1. Go to Auth0 Dashboard → Applications → "Best Husband Ever"
2. Click the **"Connections"** tab (next to Settings)
3. **Verify:** "google-oauth2" should be **enabled** (toggle should be ON/blue)
4. If it's disabled, **enable it** and save

### Step 2: Verify Google Connection Has Credentials

1. Go to Auth0 Dashboard → Authentication → Social
2. Click on **"google-oauth2"**
3. **Check:**
   - ✅ **Client ID** field should be filled in (not empty)
   - ✅ **Client Secret** field should be filled in (not empty)
   - ✅ No error messages or warnings

**If Client ID or Client Secret are missing:**
- The Google connection isn't fully configured
- You'll need to set up Google OAuth credentials (see below)

### Step 3: Verify Application Type

1. Go to Auth0 Dashboard → Applications → "Best Husband Ever" → Settings
2. **Verify:** Application Type should be **"Regular Web Application"** (NOT "Single Page Application")
3. **Verify:** Token Endpoint Authentication Method should be **"Post"** (recommended)

### Step 4: Verify Environment Variables (In Vercel)

If you have access to Vercel dashboard, verify these are set correctly:

- `AUTH0_BASE_URL` = `https://www.besthusbandever.com` (or your production URL)
- `AUTH0_ISSUER_BASE_URL` = `https://YOUR-TENANT.auth0.com` (your Auth0 domain)
- `AUTH0_CLIENT_ID` = Should match your Auth0 Application Client ID
- `AUTH0_CLIENT_SECRET` = Should match your Auth0 Application Client Secret
- `AUTH0_SECRET` = Should be set (used for session encryption)

## 🧪 How to Test (When User Tries Again)

### Expected Flow:
1. User clicks "Sign Up & Take Test" or "Start Free Trial"
2. Redirects to Auth0 login page (`us.auth0.com`)
3. User clicks "Continue with Google"
4. Redirects to Google sign-in
5. User signs in with Google
6. Redirects back to Auth0 callback
7. Redirects to `/api/auth/callback` on your site
8. Finally redirects to `/dashboard` (because of `returnTo=/dashboard`)

### If It Still Fails:

**Check Auth0 Logs:**
1. Go to Auth0 Dashboard → Monitoring → Logs
2. Filter for "Error" or "Failed" type
3. Look for entries around the time the user tried to sign up
4. Click on the error to see details
5. Share the error message - it will tell us exactly what's wrong

**Common Error Messages:**
- "Invalid callback URL" → Callback URLs not configured correctly
- "Connection not enabled" → Google connection not enabled for app
- "Invalid credentials" → Google OAuth credentials missing/incorrect
- "CORS error" → Web Origins not configured correctly

## 🔧 If Google OAuth Credentials Are Missing

If the Google connection doesn't have Client ID and Client Secret, you'll need to set them up:

### Option 1: Use Auth0's Default Google Connection (Easiest)
1. Auth0 provides a default Google connection that works out of the box
2. You just need to enable it for your application
3. No Google Cloud Console setup needed

### Option 2: Set Up Your Own Google OAuth (More Control)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application type**: Web application
6. Add **Authorized redirect URIs**: `https://YOUR-TENANT.auth0.com/login/callback`
   - Replace `YOUR-TENANT` with your Auth0 tenant name (e.g., `dev-m8ch7cyvv1dedzwf`)
7. Copy Client ID and Client Secret
8. Paste them into Auth0 → Authentication → Social → google-oauth2

## 📋 Quick Verification Commands

You can verify your Auth0 configuration is correct by checking:

1. **Callback URLs include both www and non-www**
2. **Web Origins include both www and non-www**
3. **Google connection is enabled for your app**
4. **Google connection has credentials (or uses Auth0 default)**

## ✅ Most Likely Status

Based on what we've done:
- ✅ URLs are now configured correctly
- ✅ Signup buttons have returnTo parameter
- ❓ Need to verify: Google connection enabled for app
- ❓ Need to verify: Google connection has credentials

**The most common remaining issue is:** Google connection not enabled for the application, or Google OAuth credentials missing.

## 🎯 Next Steps

1. **Verify Steps 1-3 above in Auth0 Dashboard** (takes 2 minutes)
2. **Wait for user to test tomorrow**
3. **If it fails, check Auth0 Logs** for specific error message
4. **Share the error** and we'll fix it immediately

The configuration should be correct now, but we need to verify the Google connection is fully enabled and has credentials.


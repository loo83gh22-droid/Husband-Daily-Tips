# Google Login Not Working - Troubleshooting Guide

## Google Connection is ON, But Still Not Working

If Google is toggled ON in Connections but clicking "Continue with Google" does nothing, it means Google OAuth isn't fully configured.

## Check 1: Is Google Connection Configured?

1. **In Auth0 Dashboard**, go to: **Authentication** → **Social** (left sidebar)
2. **Click** on "Google" in the list
3. **Check**: Does it show:
   - ✅ "Enabled" and has Client ID/Secret configured?
   - ❌ OR "Not Configured" / "Needs Setup"?

### If It Says "Not Configured" or Needs Setup:

You need to set up Google OAuth credentials:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Google+ API** or **Google Identity API**
4. **Go to**: APIs & Services → Credentials
5. **Create OAuth 2.0 Client ID**:
   - Application type: Web application
   - Name: "Best Husband Ever Auth0"
   - Authorized redirect URIs: 
     ```
     https://dev-m8ch7cyvv1dedzwf.us.auth0.com/login/callback
     ```
6. **Copy** the Client ID and Client Secret
7. **Go back to Auth0**: Authentication → Social → Google
8. **Paste** Client ID and Client Secret
9. **Save**

## Check 2: Browser Console Errors

When you click "Continue with Google", check for errors:

1. **Open Browser Console**: Press `F12` (or right-click → Inspect → Console tab)
2. **Click** "Continue with Google" again
3. **Look** for any red error messages
4. **Share** what you see (errors, warnings)

## Check 3: Check Redirect URI

Make sure in Google OAuth settings, you have this redirect URI:
```
https://dev-m8ch7cyvv1dedzwf.us.auth0.com/login/callback
```

**NOT** your app URL - Auth0's callback URL!

## Quick Test: Check Google Connection Details

In Auth0 → Authentication → Social → Google, what do you see?

- ✅ "Enabled" with Client ID filled in = Should work
- ❌ "Not Configured" or empty fields = Needs setup

Let me know what you see there!


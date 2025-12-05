# Fix "Continue with Google" Signup Issue

## The Problem
When users click "Continue with Google" during signup, they're redirected back to the signup page instead of completing authentication and being taken to the dashboard.

## Common Causes & Solutions

### 1. Google Social Connection Not Enabled in Auth0 ⚠️ **MOST LIKELY ISSUE**

**Check:**
1. Go to Auth0 Dashboard → Authentication → Social
2. Look for "Google" in the list of connections
3. If it's not there or disabled, you need to enable it

**Fix:**
1. Go to Auth0 Dashboard: https://manage.auth0.com/
2. Navigate to **Authentication** → **Social**
3. Click **+ Create Connection**
4. Select **Google**
5. Configure:
   - **Name**: Google (or Google OAuth)
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console
   - **Scope**: `openid profile email`
6. **Enable the connection** for your application
7. Save changes

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application type**: Web application
6. Add **Authorized redirect URIs**: `https://YOUR-TENANT.auth0.com/login/callback`
7. Copy Client ID and Client Secret to Auth0

### 2. Callback URLs Not Configured Correctly

**Check in Auth0 Dashboard → Applications → Your App → Settings:**

**Allowed Callback URLs** must include:
```
http://localhost:3000/api/auth/callback, https://www.besthusbandever.com/api/auth/callback, https://besthusbandever.com/api/auth/callback
```

**Allowed Logout URLs** must include:
```
http://localhost:3000, https://www.besthusbandever.com, https://besthusbandever.com
```

**Allowed Web Origins** must include:
```
http://localhost:3000, https://www.besthusbandever.com, https://besthusbandever.com
```

**Important:** Make sure there are NO trailing slashes and URLs match exactly (including www vs non-www)

### 3. Missing returnTo Parameter

When users sign up, they should be redirected to the dashboard after login. The current implementation might not be handling this correctly.

**Check:** When clicking "Sign Up & Take Test", the URL should be:
```
/api/auth/login?returnTo=/dashboard
```

### 4. Environment Variables

Verify these are set correctly in your production environment (Vercel):

- `AUTH0_SECRET` - Must match what's in Auth0
- `AUTH0_BASE_URL` - Should be `https://www.besthusbandever.com` (or your production URL)
- `AUTH0_ISSUER_BASE_URL` - Should be `https://YOUR-TENANT.auth0.com`
- `AUTH0_CLIENT_ID` - Must match Auth0 Application Client ID
- `AUTH0_CLIENT_SECRET` - Must match Auth0 Application Client Secret

### 5. Auth0 Application Type

**Check:** Your Auth0 application should be:
- **Application Type**: Regular Web Application (NOT Single Page Application)
- **Token Endpoint Authentication Method**: Post (recommended)

## Testing Steps

1. **Clear browser cookies** for your domain
2. Go to your signup page
3. Click "Continue with Google"
4. You should be redirected to Google login
5. After Google login, you should be redirected back to `/api/auth/callback`
6. Then redirected to `/dashboard` (or the returnTo URL)

## Debugging

If it still doesn't work, check:

1. **Browser Console** - Look for any JavaScript errors
2. **Network Tab** - Check the redirect chain:
   - Should go: `/api/auth/login` → Auth0 → Google → Auth0 callback → `/api/auth/callback` → Dashboard
3. **Auth0 Logs** - Go to Auth0 Dashboard → Monitoring → Logs
   - Look for failed authentication attempts
   - Check for error messages

## Quick Checklist

- [ ] Google social connection is enabled in Auth0
- [ ] Google OAuth credentials are configured correctly
- [ ] Callback URLs include your production domain
- [ ] Web Origins include your production domain
- [ ] Logout URLs include your production domain
- [ ] Environment variables are set correctly in Vercel
- [ ] Application type is "Regular Web Application"
- [ ] No trailing slashes in URLs
- [ ] Both www and non-www versions are included

## Still Not Working?

If after checking all of the above it still doesn't work:

1. **Check Auth0 Logs** for specific error messages
2. **Test with a different browser** (incognito mode)
3. **Verify Google OAuth consent screen** is configured in Google Cloud Console
4. **Check if Google account has proper permissions** (some organizations restrict OAuth)


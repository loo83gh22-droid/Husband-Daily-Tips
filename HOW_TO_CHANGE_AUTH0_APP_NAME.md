# How to Change Auth0 Application Name to "Best Husband Ever"

## Once You Regain Access to Auth0

### Step 1: Log into Auth0 Dashboard
1. Go to: https://manage.auth0.com/
2. Log in with your credentials
3. Select your tenant: `dev-m8ch7cyvv1dedzwf`

### Step 2: Navigate to Applications
1. In the left sidebar, click **"Applications"**
2. Find your application (currently named "Husband Daily Tips")
3. Click on it to open

### Step 3: Change the Name
1. You'll see the **Settings** tab (should be open by default)
2. At the top, find the **"Name"** field
3. Change it from: `Husband Daily Tips`
4. To: `Best Husband Ever`
5. Click **"Save Changes"** at the bottom

### Step 4: Verify
1. The name change should be immediate
2. When users log in, they'll see "Best Husband Ever" instead of "Husband Daily Tips"
3. Test by logging out and logging back in

## Alternative: If You Have Multiple Applications

If you have multiple Auth0 applications:
1. Check the **Application ID** or **Client ID** to find the right one
2. Your Client ID should match what's in your environment variables (`AUTH0_CLIENT_ID`)

## What Gets Changed

✅ **Login Screen**: Users will see "Best Husband Ever" on the Auth0 login page  
✅ **Application List**: Shows as "Best Husband Ever" in Auth0 dashboard  
❌ **Domain/URL**: Stays the same (`dev-m8ch7cyvv1dedzwf.us.auth0.com`)  
❌ **Client ID/Secret**: Stays the same (no need to update environment variables)

## Recovering Access (If You Can't Log In)

If you still can't get the password reset email:

1. **Contact Auth0 Support**: https://support.auth0.com/
   - Explain the password reset email isn't arriving
   - Provide your tenant name: `dev-m8ch7cyvv1dedzwf`
   - Provide your email: `waterloo1983hawk22@gmail.com`

2. **Try Alternative Access Methods**:
   - Check if you have access via GitHub SSO (if enabled)
   - Check if you have access via another email account
   - Check if a teammate/co-worker has admin access

3. **Check Email Settings**:
   - Ensure Auth0 emails aren't being blocked
   - Check Gmail filters for auto-delete rules
   - Try updating email address in Auth0 (requires dashboard access)

## Code Changes Already Made

✅ Updated calendar file names: `best-husband-ever.ics`  
✅ Updated calendar PRODID: `-//Best Husband Ever//EN`  
✅ App metadata already says "Best Husband Ever"  
⏳ **Waiting**: Auth0 application name change (requires dashboard access)

Once you can access Auth0 and change the name, everything will be consistent!


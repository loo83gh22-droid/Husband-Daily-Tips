# Fix Auth0 CORS Error

## The Issue
The CORS error occurs because Auth0 needs to be configured to allow requests from your production domain.

## Solution: Update Auth0 Settings

1. **Go to Auth0 Dashboard**
   - Navigate to: https://manage.auth0.com/
   - Select your application

2. **Go to Settings Tab**

3. **Update the following fields:**

   **Allowed Callback URLs:**
   ```
   http://localhost:3000/api/auth/callback, https://www.besthusbandever.com/api/auth/callback, https://besthusbandever.com/api/auth/callback
   ```

   **Allowed Logout URLs:**
   ```
   http://localhost:3000, https://www.besthusbandever.com, https://besthusbandever.com
   ```

   **Allowed Web Origins:** ⚠️ **THIS IS THE KEY ONE FOR CORS**
   ```
   http://localhost:3000, https://www.besthusbandever.com, https://besthusbandever.com
   ```

4. **Save Changes**

5. **Wait 1-2 minutes** for changes to propagate

6. **Test again** - The CORS error should be resolved

## Why This Happens

- Auth0 requires explicit permission for each origin that makes requests
- The "Allowed Web Origins" setting specifically controls CORS headers
- Without this, browsers block the preflight request

## Additional Notes

- Make sure you include both `www.besthusbandever.com` and `besthusbandever.com` (with and without www)
- The error should disappear after updating Auth0 settings
- No code changes needed - this is purely an Auth0 configuration issue


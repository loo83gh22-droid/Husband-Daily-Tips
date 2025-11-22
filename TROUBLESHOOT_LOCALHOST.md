# Troubleshooting Localhost Not Loading

## Common Issues and Fixes

### 1. Missing .env.local File
The app requires environment variables to run. Create a `.env.local` file in the root directory with:

```env
# Auth0
AUTH0_SECRET=your-secret-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Calendar Feed Secret
CALENDAR_FEED_SECRET=your-secret-here
```

### 2. Port 3000 Already in Use
If port 3000 is busy, either:
- Kill the process using port 3000
- Or run on a different port: `npm run dev -- -p 3001`

### 3. Dependencies Not Installed
Run: `npm install`

### 4. Check for Errors
Look at the terminal output when running `npm run dev` for specific error messages.

### 5. Try These Steps:
1. **Stop any running servers**: Close all terminal windows running npm/node
2. **Clear cache**: `rm -rf .next` (or delete `.next` folder on Windows)
3. **Reinstall dependencies**: `npm install`
4. **Start fresh**: `npm run dev`
5. **Check the terminal** for any error messages

### 6. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors.

### 7. Verify Node.js Version
Make sure you have Node.js 18+: `node --version`


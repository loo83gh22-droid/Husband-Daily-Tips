# Debugging Email 500 Error

## Step 1: Check Your Dev Server Terminal

**Look at the terminal where `npm run dev` is running** - that's where the error details are!

You should see red error messages like:
- `Error fetching users: ...`
- `RESEND_API_KEY not configured`
- `SUPABASE_SERVICE_ROLE_KEY not configured`
- etc.

**Copy the error message** and share it with me.

---

## Step 2: Check Environment Variables

Make sure your `.env.local` file has ALL of these:

```env
# Auth0
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_SECRET=your_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (NEW - Add these!)
RESEND_API_KEY=re_your_api_key_here
CRON_SECRET=08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345
RESEND_FROM_EMAIL=Husband Daily Tips <onboarding@resend.dev>
```

**Common Issues:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` missing → Add it to `.env.local`
- ❌ `RESEND_API_KEY` missing → Add your Resend API key
- ❌ Wrong values → Double-check they're correct

---

## Step 3: Restart Dev Server

After adding/changing environment variables:

1. **Stop the dev server** (Ctrl+C)
2. **Start it again**: `npm run dev`
3. **Try the test command again**

---

## Step 4: Get Better Error Details

Run this command to see the actual error message:

**PowerShell:**
```powershell
try {
    $headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/cron/send-tomorrow-tips" -Method GET -Headers $headers
    $response.Content
} catch {
    $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host "Error Response:" -ForegroundColor Red
    Write-Host $responseBody
}
```

This will show you the actual error message from the server.

---

## Common Errors & Fixes

### Error: "SUPABASE_SERVICE_ROLE_KEY missing"
**Fix**: Add `SUPABASE_SERVICE_ROLE_KEY=your_key` to `.env.local`

### Error: "RESEND_API_KEY not configured"
**Fix**: Add `RESEND_API_KEY=re_your_key` to `.env.local`

### Error: "Failed to fetch users"
**Fix**: 
- Check Supabase connection
- Make sure you have at least one user in the database
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

### Error: "No tips available"
**Fix**: Make sure you ran the initial database migration with tips

---

## Quick Checklist

- [ ] `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `.env.local` has `RESEND_API_KEY`
- [ ] `.env.local` has `CRON_SECRET`
- [ ] Dev server restarted after adding variables
- [ ] At least one user exists in database
- [ ] Tips exist in database (from migration 001)

---

**Most likely issue**: Missing `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` in `.env.local`

Check your dev server terminal for the exact error message!


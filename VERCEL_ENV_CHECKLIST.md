# Vercel Environment Variables Checklist

## ✅ Auth0 - Already Configured
You've already set up Auth0 with `besthusbandever.com` - perfect!

## ⚠️ Important: Update Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Make sure `AUTH0_BASE_URL` is set to your production domain:

```
AUTH0_BASE_URL=https://besthusbandever.com
```

**NOT** `http://localhost:3000` or `https://your-app.vercel.app`

---

## All Required Environment Variables

Make sure these are set in Vercel (for Production, Preview, and Development):

### Auth0
```
AUTH0_SECRET=your-secret-here
AUTH0_BASE_URL=https://besthusbandever.com  ← UPDATE THIS!
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional (for email)
```
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@besthusbandever.com
CRON_SECRET=your-cron-secret
```

---

## After Updating Environment Variables

1. **Redeploy** your app in Vercel (or wait for auto-deploy)
2. **Test** at https://besthusbandever.com

---

## Quick Test

Once deployed, visit:
- https://besthusbandever.com
- Click "Sign In"
- Should redirect to Auth0 and back correctly


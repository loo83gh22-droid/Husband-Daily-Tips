# Environment Variables Reference

**⚠️ SECURITY WARNING: This file should NOT contain actual secrets. Use this as a template and store actual values securely.**

## Required Environment Variables

### Auth0
```
AUTH0_SECRET=<generate with: openssl rand -hex 32>
AUTH0_BASE_URL=https://besthusbandever.com (or http://localhost:3000 for dev)
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

### Resend (Email)
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Best Husband Ever <action@besthusbandever.com>
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx (or sk_live_ for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Cron Jobs
```
CRON_SECRET=your-secret-for-cron-authentication
```

### Admin
```
ADMIN_EMAIL=your-email@example.com (for survey response notifications)
```

---

## Where to Find These Values

### Auth0
- Dashboard → Applications → Your App → Settings
- `AUTH0_SECRET`: Generate with `openssl rand -hex 32`

### Supabase
- Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)

### Resend
- Dashboard → API Keys
- Create new API key if needed

### Stripe
- Dashboard → Developers → API keys
- Test keys for development, Live keys for production

### Cron Secret
- Generate with: `openssl rand -hex 32`
- Store securely, use same value in Vercel

---

## Storage Locations

### Production (Vercel)
- Vercel Dashboard → Project → Settings → Environment Variables
- Add all variables here for production deployment

### Local Development
- `.env.local` file (already in .gitignore ✅)
- Never commit this file

### Backup Storage
- Store in password manager (1Password, LastPass)
- Or encrypted file
- Never in Git or unsecured locations

---

## Verification Checklist

- [ ] All Auth0 variables set
- [ ] All Supabase variables set
- [ ] Resend API key configured
- [ ] Stripe keys set (test or live)
- [ ] CRON_SECRET generated and set
- [ ] ADMIN_EMAIL set for notifications
- [ ] All variables added to Vercel
- [ ] Local `.env.local` file created
- [ ] Backup stored securely

---

## Security Best Practices

1. ✅ Never commit `.env` files (already in .gitignore)
2. ✅ Use different keys for development and production
3. ✅ Rotate secrets periodically
4. ✅ Store backups in encrypted password manager
5. ✅ Limit access to production secrets
6. ✅ Use environment-specific keys (test vs live)

---

## Quick Recovery

If you lose access to environment variables:

1. **Auth0:** Dashboard → Applications → Settings
2. **Supabase:** Dashboard → Settings → API
3. **Resend:** Dashboard → API Keys
4. **Stripe:** Dashboard → Developers → API Keys
5. **CRON_SECRET:** Regenerate with `openssl rand -hex 32`
6. **ADMIN_EMAIL:** Your email address

---

## Notes

- Update this document when adding new environment variables
- Keep actual values in password manager, not this file
- Review and rotate secrets quarterly
- Document any custom or additional variables here


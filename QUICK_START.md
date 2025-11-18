# Quick Start Guide

## 🚀 Get Running in 5 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Services

**Auth0:**
- Create app at auth0.com
- Get: Domain, Client ID, Client Secret
- Generate secret: `openssl rand -hex 32`

**Supabase:**
- Create project at supabase.com
- Get: Project URL, Anon Key, Service Role Key
- Run SQL from `supabase/migrations/001_initial_schema.sql`

### 3. Create `.env.local`
```env
AUTH0_SECRET=your-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Locally
```bash
npm run dev
```

### 5. Deploy to Vercel
- Connect GitHub repo
- Add environment variables
- Deploy!

## 📚 Full Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **PROJECT_SUMMARY.md** - Complete project overview
- **MONETIZATION_STRATEGY.md** - Business strategy
- **supabase/README.md** - Database setup

## 🎯 What You Get

✅ Complete authentication system
✅ Daily tips with randomization
✅ Subscription tier management
✅ Progress tracking (streaks, stats)
✅ Beautiful, responsive UI
✅ Production-ready code
✅ Sample tips in database

## 💡 Next Steps

1. Add more tips to database
2. Integrate Stripe for payments (see example files)
3. Customize design/branding
4. Add email notifications
5. Set up analytics

## 🆘 Need Help?

Check SETUP_GUIDE.md for detailed troubleshooting and step-by-step instructions.



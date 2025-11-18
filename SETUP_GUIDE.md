# Complete Setup Guide - Husband Daily Tips

This guide will walk you through setting up your webapp step by step.

## Step 1: Prerequisites

Make sure you have:
- Node.js 18+ installed
- A GitHub account
- An Auth0 account (free tier works)
- A Supabase account (free tier works)
- A Vercel account (free tier works)

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Auth0

1. **Create an Auth0 Application**
   - Go to [auth0.com](https://auth0.com) and sign up/login
   - Navigate to Applications → Create Application
   - Choose "Regular Web Application"
   - Name it "Husband Daily Tips"

2. **Configure Auth0 Settings**
   - Go to Settings tab
   - Set **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback, https://your-domain.vercel.app/api/auth/callback`
   - Set **Allowed Logout URLs**: `http://localhost:3000, https://your-domain.vercel.app`
   - Set **Allowed Web Origins**: `http://localhost:3000, https://your-domain.vercel.app`
   - Save changes

3. **Get Your Auth0 Credentials**
   - Copy your **Domain** (e.g., `your-tenant.auth0.com`)
   - Copy your **Client ID**
   - Copy your **Client Secret**

4. **Generate AUTH0_SECRET**
   ```bash
   openssl rand -hex 32
   ```
   Copy this value.

## Step 4: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and sign up/login
   - Click "New Project"
   - Choose an organization, name your project, set a database password
   - Wait for project to be created (takes ~2 minutes)

2. **Run Database Migrations**
   - In Supabase dashboard, go to SQL Editor
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy and paste the entire contents into SQL Editor
   - Click "Run"
   - You should see "Success. No rows returned"

3. **Set Up Row Level Security (Optional but Recommended)**
   - In SQL Editor, run the RLS policies from `supabase/README.md`
   - This ensures users can only access their own data

4. **Get Your Supabase Credentials**
   - Go to Settings → API
   - Copy your **Project URL**
   - Copy your **anon/public key**
   - Copy your **service_role key** (keep this secret!)

## Step 5: Configure Environment Variables

1. **Create `.env.local` file** in the root directory:

```env
# Auth0
AUTH0_SECRET=your-generated-secret-from-step-3
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. **Replace all placeholder values** with your actual credentials

## Step 6: Test Locally

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:3000`

3. **Test the flow**:
   - Click "Sign In" → Should redirect to Auth0 login
   - Log in with Auth0
   - Should redirect back to dashboard
   - You should see today's tip (if you have tips in database)

## Step 7: Set Up GitHub Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub Repository**:
   - Go to GitHub.com
   - Click "New repository"
   - Name it (e.g., "husband-daily-tips")
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/your-username/husband-daily-tips.git
   git branch -M main
   git push -u origin main
   ```

## Step 8: Deploy to Vercel

1. **Import Project**:
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**:
   - In Vercel project settings, go to Environment Variables
   - Add all the variables from your `.env.local`:
     - `AUTH0_SECRET`
     - `AUTH0_BASE_URL` (use your Vercel URL: `https://your-project.vercel.app`)
     - `AUTH0_ISSUER_BASE_URL`
     - `AUTH0_CLIENT_ID`
     - `AUTH0_CLIENT_SECRET`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Update Auth0 Callback URLs**:
   - Go back to Auth0 dashboard
   - Update Allowed Callback URLs to include your Vercel URL
   - Update Allowed Logout URLs to include your Vercel URL
   - Update Allowed Web Origins to include your Vercel URL

4. **Deploy**:
   - Click "Deploy" in Vercel
   - Wait for deployment to complete
   - Your app should be live!

## Step 9: Adding Payment Integration (Optional)

To enable actual payments, you'll need to integrate Stripe:

1. **Install Stripe**:
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Create Stripe Account**:
   - Go to [stripe.com](https://stripe.com)
   - Create account and get API keys

3. **Create Checkout API Route**:
   - Create `app/api/checkout/route.ts`
   - Implement Stripe checkout session creation

4. **Create Webhook Handler**:
   - Create `app/api/webhooks/stripe/route.ts`
   - Handle subscription events and update Supabase

5. **Update Subscription Page**:
   - Connect buttons to checkout API
   - Handle success/cancel redirects

See Stripe documentation for detailed implementation.

## Troubleshooting

### Auth0 Issues
- Make sure callback URLs match exactly (including http vs https)
- Check that AUTH0_SECRET is set correctly
- Verify Client ID and Secret are correct

### Supabase Issues
- Ensure migrations ran successfully
- Check that RLS policies allow your operations
- Verify environment variables are set correctly

### Vercel Deployment Issues
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Auth0 callback URLs include Vercel domain

## Next Steps

1. **Add More Tips**: Use Supabase SQL Editor to add more tips
2. **Customize Design**: Modify Tailwind classes in components
3. **Add Features**: 
   - Email notifications
   - Push notifications
   - Mobile app
   - Community features
4. **Set Up Payments**: Integrate Stripe for subscriptions
5. **Analytics**: Add analytics to track user engagement
6. **Marketing**: Set up landing page SEO, social sharing

## Support

If you encounter issues:
1. Check the error logs in Vercel dashboard
2. Check browser console for client-side errors
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly



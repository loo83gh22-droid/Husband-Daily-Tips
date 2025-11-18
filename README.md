# Husband Daily Tips - Web App

A subscription-based web application that provides daily tips and guidance to help husbands become better partners.

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Authentication**: Auth0
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

## Features

- 🔐 Secure authentication with Auth0
- 📅 Daily personalized tips
- 💳 Subscription management
- 📊 Progress tracking
- 🎯 Personalized content based on user preferences

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Auth0 account and application
- Supabase project
- GitHub account
- Vercel account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Auth0
AUTH0_SECRET='use [openssl rand -hex 32] to generate'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Supabase
NEXT_PUBLIC_SUPABASE_URL='your-supabase-url'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your-supabase-anon-key'
SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
```

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd husband-daily-tips
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the SQL scripts in `supabase/migrations/` to set up your database schema.

## Deployment

### GitHub Setup

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Vercel Deployment

1. Import your GitHub repository in Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy!

## Monetization Ideas

1. **Subscription Tiers**:
   - Free: 1 tip per week
   - Basic ($9.99/month): Daily tips
   - Premium ($19.99/month): Daily tips + personalized advice + progress tracking
   - Pro ($29.99/month): All features + relationship coaching resources

2. **Value Propositions**:
   - Expert-curated tips from relationship counselors
   - Personalized based on relationship stage
   - Progress tracking and achievements
   - Community access (future feature)
   - Weekly relationship check-ins

3. **Engagement Features**:
   - Daily streak tracking
   - Achievement badges
   - Tip favorites/bookmarks
   - Share tips with spouse
   - Reflection journal

## License

MIT


"# Husband-Daily-Tips" 

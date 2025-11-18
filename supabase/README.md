# Supabase Database Setup

This directory contains SQL migration files for setting up your Supabase database.

## Setup Instructions

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Migrations**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `001_initial_schema.sql`
   - Run the migration

3. **Set Up Row Level Security (RLS)**

After running the initial migration, you'll need to set up RLS policies. Run this in your SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tips ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth0_id = current_setting('app.auth0_id', true));

-- Tips are readable by all authenticated users
CREATE POLICY "Tips are readable by authenticated users" ON tips
  FOR SELECT USING (true);

-- Users can read their own tip history
CREATE POLICY "Users can read own tip history" ON user_tips
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
  ));

-- Users can insert their own tip history
CREATE POLICY "Users can insert own tip history" ON user_tips
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
  ));

-- Users can update their own tip history
CREATE POLICY "Users can update own tip history" ON user_tips
  FOR UPDATE USING (user_id IN (
    SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
  ));
```

**Note**: For production, you'll need to create a Supabase function or use the service role key for user creation, as RLS will prevent direct inserts. The current implementation uses the service role key for user creation.

## Database Schema

### Tables

1. **users** - Stores user information linked to Auth0
   - `id` (UUID, Primary Key)
   - `auth0_id` (TEXT, Unique) - Auth0 user ID
   - `email` (TEXT)
   - `name` (TEXT)
   - `subscription_tier` (TEXT) - 'free', 'premium', or 'pro'
   - `created_at`, `updated_at` (Timestamps)

2. **tips** - Stores all tips
   - `id` (UUID, Primary Key)
   - `title` (TEXT)
   - `content` (TEXT)
   - `category` (TEXT)
   - `tier` (TEXT) - 'free', 'premium', or 'pro'
   - `created_at`, `updated_at` (Timestamps)

3. **user_tips** - Tracks which tips users have received
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to users)
   - `tip_id` (UUID, Foreign Key to tips)
   - `date` (DATE)
   - `completed` (BOOLEAN)
   - `favorited` (BOOLEAN)
   - `created_at` (Timestamp)

## Adding More Tips

You can add more tips by running INSERT statements in the Supabase SQL Editor:

```sql
INSERT INTO tips (title, content, category, tier) VALUES
  ('Your Tip Title', 'Your tip content here...', 'Category Name', 'premium');
```

Categories can be: Communication, Appreciation, Romance, Partnership, Connection, Support, Growth, etc.



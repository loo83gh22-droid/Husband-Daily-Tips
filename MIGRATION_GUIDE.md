# Running Supabase Migrations

There are several ways to run migrations for your Supabase database:

## Option 1: Supabase CLI (Recommended - Automated)

The Supabase CLI can automatically run migrations. Here's how to set it up:

### Install Supabase CLI

**Windows (PowerShell):**
```powershell
# Using npm (if you have Node.js)
npm install -g supabase

# Or using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

### Initialize Supabase in Your Project

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Your project ref is in your Supabase dashboard URL:
# https://supabase.com/dashboard/project/[PROJECT_REF]
```

### Run Migrations

```bash
# Push all pending migrations
supabase db push

# Or run a specific migration
supabase migration up
```

## Option 2: Manual (Current Method)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of the migration file
5. Click **Run**

## Option 3: Node.js Script (Semi-Automated)

I've created a `run-migration.js` script that you can use:

```bash
# Run the latest migration
node run-migration.js

# Run a specific migration
node run-migration.js 023_add_new_relationship_actions.sql
```

**Note:** This script requires:
- `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

The service role key has admin access, so keep it secure and never commit it to git.

## Which Method Should You Use?

- **Supabase CLI**: Best for ongoing development, automatically tracks which migrations have run
- **Manual**: Most reliable, works for all SQL statements, good for one-off migrations
- **Node.js Script**: Convenient but may not work for all complex SQL statements

For now, the manual method is the most reliable. Once you set up Supabase CLI, you can use `npm run migrate` to push migrations automatically.


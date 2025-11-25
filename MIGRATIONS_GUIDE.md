# Supabase Migrations Guide

This guide explains how to run Supabase migrations automatically or manually.

## Automatic Migration (Recommended)

### Option 1: Using Supabase CLI (Best Method)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in Supabase dashboard → Settings → General)

3. **Run migrations:**
   ```bash
   npm run migrations:run
   ```
   Or directly:
   ```bash
   supabase db push
   ```

### Option 2: Check Migration Status

To see which migrations are pending:
```bash
npm run migrations:status
```

## Manual Migration

If you prefer to run migrations manually:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Open each migration file from `supabase/migrations/` in order
4. Copy and paste the SQL into the editor
5. Click **Run**

## Migration Files

All migration files are in `supabase/migrations/` and are numbered sequentially:
- `001_initial_schema.sql`
- `002_badges_and_reflections.sql`
- `003_recurring_tips_and_calendar.sql`
- ... and so on

**Important:** Always run migrations in numerical order!

## Troubleshooting

### "Supabase CLI not found"
- Install it: `npm install -g supabase`
- Or use manual method above

### "Project not linked"
- Run: `supabase link --project-ref your-project-ref`
- Get your project ref from Supabase dashboard

### "Migration already exists"
- This is normal if you've run the migration before
- The migration system tracks which ones have been executed
- You can safely skip already-executed migrations

## Notes

- Migrations are idempotent (safe to run multiple times)
- Always backup your database before running migrations in production
- Test migrations in a development environment first


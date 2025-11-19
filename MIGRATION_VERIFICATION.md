# Database Migration Verification Checklist

Use this checklist to verify all migrations ran successfully.

## ✅ Verification Steps

### 1. Check Tables Exist
Go to **Supabase → Table Editor** and verify these tables exist:

- [ ] `badges` - Should have 20 rows
- [ ] `user_badges` - Empty (users haven't earned badges yet)
- [ ] `reflections` - Empty (users haven't written reflections yet)
- [ ] `deep_thoughts` - Empty (no shared reflections yet)
- [ ] `deep_thoughts_comments` - Empty
- [ ] `recurring_tip_completions` - Empty
- [ ] `challenges` - Should have 30 rows
- [ ] `user_challenge_completions` - Empty

### 2. Check Tips Table Updates
Go to **Table Editor → `tips`** and verify:

- [ ] The "Weekly Relationship Check-In" tip has:
  - `is_recurring` = `true`
  - `recurrence_type` = `weekly`
  - `recurrence_day` = `0` (Sunday)

### 3. Check Users Table Updates
Go to **Table Editor → `users`** and verify:

- [ ] The `calendar_preferences` column exists (JSONB type)

### 4. Quick SQL Verification Queries

Run these in **SQL Editor** to verify counts:

```sql
-- Should return 20
SELECT COUNT(*) FROM badges;

-- Should return 30
SELECT COUNT(*) FROM challenges;

-- Should return 1 (the Weekly Check-In tip)
SELECT COUNT(*) FROM tips WHERE is_recurring = true;

-- Check badge types
SELECT badge_type, COUNT(*) FROM badges GROUP BY badge_type;
-- Should show: consistency (10), big_idea (10)

-- Check challenge categories
SELECT category, COUNT(*) FROM challenges GROUP BY category;
-- Should show: Communication (5), Romance (5), Gratitude (5), Partnership (5), Intimacy (5), Conflict Resolution (5)
```

## 🎉 Success Indicators

If all checks pass:
- ✅ Database schema is complete
- ✅ All tables created successfully
- ✅ Badges and challenges inserted
- ✅ Recurring tips configured
- ✅ Ready for application use!

## 🐛 Troubleshooting

**If badge count is wrong:**
- Run the INSERT statement from Migration 002 again (it will skip duplicates)

**If challenge count is wrong:**
- Run the INSERT statements from Migration 004 again (they will skip duplicates)

**If triggers are missing:**
- Check that the `update_updated_at_column()` function exists
- Re-run the trigger creation statements from the migrations

**If you see constraint errors:**
- The migrations use `IF EXISTS` and `IF NOT EXISTS` - they should be safe to re-run


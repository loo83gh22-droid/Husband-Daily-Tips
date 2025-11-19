# Cleanup Checklist

## ✅ Completed

1. **Deleted old challenges API route**
   - ✅ Removed `app/api/challenges/complete/route.ts`
   - ✅ New route exists at `app/api/actions/complete/route.ts`

2. **Build is working**
   - ✅ `npm run build` completes successfully
   - ⚠️ Dynamic server usage warnings are expected (API routes using cookies)

## ⚠️ Critical: Database Migration Required

**MUST RUN BEFORE DEPLOYMENT:**

Run this migration in Supabase SQL Editor:
- File: `supabase/migrations/008_rename_challenges_to_actions.sql`

**Without this migration, the app will break in production** because:
- Code is looking for `actions` table
- Database still has `challenges` table
- Code is looking for `user_action_completions` table
- Database still has `user_challenge_completions` table

## 📋 Optional Cleanup (Historical Files - Safe to Keep)

These files reference "challenges" but are historical/documentation:
- `supabase/migrations/004_challenges.sql` - Historical migration (keep)
- `supabase/migrations/005_challenge_multiple_completions.sql` - Historical migration (keep)
- `REMOVE_DUPLICATE_CHALLENGES.sql` - Old cleanup script (can delete if desired)
- `CHECK_DUPLICATE_CHALLENGES.sql` - Old diagnostic script (can delete if desired)
- `CHALLENGE_MULTiple_COMPLETIONS.md` - Documentation (can update or delete)

## 🔍 What to Check Before Next Deployment

1. ✅ Run migration `008_rename_challenges_to_actions.sql` in Supabase
2. ✅ Verify build works: `npm run build`
3. ✅ Test locally: `npm run dev`
4. ✅ Check Vercel environment variables are set
5. ✅ Verify Auth0 callback URLs include production domain

## 🚀 Deployment Status

- **Build Status**: ✅ Passing**
- **Type Errors**: ✅ None
- **Linter Errors**: ✅ None
- **Migration Status**: ⚠️ **PENDING - Must run before deployment**

---

## Next Steps

1. **Run the database migration** (CRITICAL)
2. Test locally after migration
3. Deploy to Vercel
4. Test production deployment


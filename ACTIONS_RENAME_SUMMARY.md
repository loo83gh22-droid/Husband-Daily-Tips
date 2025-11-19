# Actions Rename Summary

## ✅ Completed Changes

### 1. Database Migration Created
- **File**: `supabase/migrations/008_rename_challenges_to_actions.sql`
- **Changes**:
  - Renames `challenges` table → `actions`
  - Renames `user_challenge_completions` table → `user_action_completions`
  - Renames `challenge_id` column → `action_id`
  - Updates all indexes and triggers

### 2. Code Updates
- ✅ Navigation: "Challenges" → "Actions"
- ✅ Page route: `/dashboard/challenges` → `/dashboard/actions`
- ✅ API route: `/api/challenges/complete` → `/api/actions/complete`
- ✅ Component files renamed:
  - `ChallengesList.tsx` → `ActionsList.tsx`
  - `ChallengeCompletionModal.tsx` → `ActionCompletionModal.tsx`
- ✅ All variable names updated: `challenge` → `action`, `challenges` → `actions`
- ✅ All database queries updated to use `actions` and `user_action_completions`
- ✅ Journal entries now show "Action completed" instead of "Challenge completed"
- ✅ Landing page copy updated

### 3. Health Calculation Updated
- ✅ **New Formula** prioritizes unique actions:
  - **Streak Component**: 50 points max (reduced from 70)
  - **History Component**: 20 points max (reduced from 30)
  - **Unique Actions Bonus**: 30 points max (NEW)
    - Counts unique tips completed + unique actions completed
    - Formula: `min(uniqueActions * 3, 30)`
- ✅ Health calculation now rewards variety over repetition

---

## ⚠️ Action Required: Run Database Migration

**You MUST run the migration in Supabase to complete the rename:**

1. Go to Supabase Dashboard → SQL Editor
2. Run: `supabase/migrations/008_rename_challenges_to_actions.sql`

This will:
- Rename the database tables
- Update all column names
- Recreate indexes and triggers

**Without this migration, the app will break** because it's now looking for `actions` table but the database still has `challenges`.

---

## Health Calculation Guide

See `HEALTH_CALCULATION_GUIDE.md` for:
- Complete formula breakdown
- Example calculations
- Benefits of the new system

---

## What Changed in Health Calculation

### Before:
- Streak: 70 points max
- History: 30 points max
- **Total**: 100 points (no unique action bonus)

### After:
- Streak: 50 points max
- History: 20 points max
- **Unique Actions**: 30 points max (NEW)
- **Total**: 100 points

### Impact:
- Users who repeat the same action get lower health scores
- Users who try different actions get higher health scores
- Encourages exploration and variety

---

## Remaining References

Some documentation files may still reference "challenges" but the core application code is fully updated.


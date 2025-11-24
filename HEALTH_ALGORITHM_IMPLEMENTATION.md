# Health Algorithm Implementation Summary

## What's Been Created

### 1. Database Migration (`045_update_health_algorithm.sql`)
- ✅ Adds `health_point_value` column to `actions` table (1, 2, or 3)
- ✅ Updates `daily_health_points` table structure
- ✅ Creates `action_completion_history` table (for repetition penalty tracking)
- ✅ Creates `weekly_health_points` table (for weekly cap tracking)
- ✅ Creates `health_decay_log` table (for missed day tracking)
- ✅ Creates `event_completion_bonuses` table (for 7-day event bonuses)

### 2. New Health Calculation (`lib/health.ts`)
- ✅ `calculateHealthScore()` - Main calculation function
- ✅ `calculateActionPoints()` - Calculates points with repetition penalty
- ✅ `recordActionCompletion()` - Records action completion with daily/weekly caps
- ✅ `recordEventCompletionBonus()` - Records 7-day event completion (+3)
- ✅ `recordMissedDay()` - Records missed days for decay (-2 per day)

## Algorithm Rules Implemented

1. ✅ **Baseline**: Starts from survey baseline (0-100)
2. ✅ **Action Points**: Each action worth 1, 2, or 3 points
3. ✅ **Daily Cap**: Max 3 points per day
4. ✅ **Weekly Cap**: Max 15 points per rolling 7-day window
5. ✅ **Event Bonus**: +3 points for 7-day event completion
6. ✅ **Decay**: -2 points per missed day
7. ✅ **Repetition Penalty**: -1 point if same action within 30 days
8. ✅ **Badges**: Do NOT affect health (already set to 0)

## What Still Needs to Be Done

### 1. Assign Point Values to Actions
- Need to determine which actions are worth 1, 2, or 3 points
- Currently defaults to: display_order <= 2 = 3pts, <= 5 = 2pts, else 1pt
- **Action needed**: Review and assign specific point values

### 2. Update Action Completion Route
- Update `app/api/actions/complete/route.ts` to use new `recordActionCompletion()`
- Remove old health point tracking
- Add repetition penalty calculation

### 3. Update Health Score Display
- Update `app/dashboard/page.tsx` to use new `calculateHealthScore()`
- Update `app/api/tips/complete/route.ts` if needed

### 4. Create Daily Cron Job
- Create cron job to call `recordMissedDay()` for each user daily
- Should run once per day to check for missed days

### 5. Update 7-Day Event Completion
- Update challenge completion logic to call `recordEventCompletionBonus()`

## Next Steps

1. Review and approve the migration
2. Assign point values to actions (1, 2, or 3)
3. Update action completion route
4. Update health score calculation calls
5. Create daily cron job for decay
6. Test the algorithm


# Goal-Setting Survey Implementation

## What's Been Added

### 1. New Survey Questions (Migration `047_add_goal_setting_survey_questions.sql`)
- ✅ Added 16 new questions (questions 14-29)
- ✅ For each of 8 action categories:
  - Self-rating question: "How [Category] are you?" (1-5 scale)
  - Improvement desire question: "Would you like to improve it?" (yes/no)

### 2. Database Schema Updates
- ✅ Added columns to `survey_summary` table to store:
  - Self-ratings for each category (1-5)
  - Improvement desires for each category (true/false)

### 3. Survey Submission Updates
- ✅ Updated `app/api/survey/submit/route.ts` to:
  - Extract goal-setting responses from survey
  - Store self-ratings and improvement desires in `survey_summary`

### 4. Action Selection Logic Updates
- ✅ Updated `app/dashboard/page.tsx` to:
  - Prioritize actions based on goal preferences
  - Priority 1: Low self-rating (1-3) AND wants improvement
  - Priority 2: Fallback to lowest category score (existing logic)

## How It Works

### Survey Flow
1. User answers 13 existing questions (baseline assessment)
2. User answers 16 new goal-setting questions:
   - 8 self-rating questions (1-5 scale)
   - 8 improvement desire questions (yes/no)
3. Responses are stored in `survey_responses`
4. Goal preferences are extracted and stored in `survey_summary`

### Action Prioritization
When selecting actions for a user:
1. **Check goal preferences first:**
   - Find categories where self-rating ≤ 3 AND wants_improvement = true
   - Prioritize by lowest self-rating (1 = highest priority)
2. **Fallback to category scores:**
   - If no goal preferences, use existing logic (lowest category score)

### 7-Day Event Recommendation
**TODO:** Update event recommendation logic to suggest events based on goal preferences.

## Categories Covered
1. Communication
2. Intimacy
3. Partnership
4. Romance
5. Gratitude
6. Conflict Resolution
7. Reconnection
8. Quality Time

## Next Steps

1. **Update OnboardingSurvey Component**
   - Add UI for the 16 new questions
   - Display self-rating scale (1-5) and yes/no for improvement

2. **Update Event Recommendation Logic**
   - Suggest 7-day events based on goal preferences
   - Show recommended event on dashboard/actions page

3. **Test the Flow**
   - Test survey submission with new questions
   - Verify goal preferences are stored correctly
   - Verify action prioritization works

4. **UI/UX Improvements**
   - Make goal-setting questions clear and engaging
   - Show user their goal preferences somewhere (maybe settings/profile?)

## Files Modified
- `supabase/migrations/047_add_goal_setting_survey_questions.sql` (NEW)
- `app/api/survey/submit/route.ts` (UPDATED)
- `app/dashboard/page.tsx` (UPDATED)

## Files That Need Updates
- `components/OnboardingSurvey.tsx` (needs UI for new questions)
- Event recommendation logic (needs to use goal preferences)


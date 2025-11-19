# Multiple Challenge Completions Feature

## Overview
Challenges can now be completed multiple times, with each completion tracked separately. This allows users to:
- Complete the same challenge multiple times (e.g., "Apologize Sincerely" 3 times for the "Apology Ace" badge)
- Add notes to each completion
- Link completions to journal entries
- See completion history and counts

## Database Changes

### Migration: `005_challenge_multiple_completions.sql`
- **Removed** the UNIQUE constraint on `(user_id, challenge_id)` to allow multiple completions
- **Added** `journal_entry_id` column to link completions to journal entries
- **Added** indexes for performance

## UI Changes

### Challenge List (`components/ChallengesList.tsx`)
- Shows completion count badge (e.g., "3" in a circle)
- Displays "Completed X times" and latest completion date
- Changed from checkbox toggle to "+" button that opens a modal
- Each completion opens a modal for notes

### Completion Modal (`components/ChallengeCompletionModal.tsx`)
- New modal component for completing challenges
- Optional notes field
- Checkbox to save to journal
- Creates journal entry if notes provided and checkbox is checked

### Journal Page (`app/dashboard/journal/page.tsx`)
- Displays challenge completions linked to journal entries
- Shows challenge icon and name for challenge-related entries
- Maintains existing tip reflection display

## API Changes

### `/api/challenges/complete` (POST)
- **Removed** check for "already completed" - allows multiple completions
- **Accepts** `notes` and `linkToJournal` parameters
- **Creates** journal entry if `linkToJournal` is true and notes are provided
- **Links** journal entry to challenge completion via `journal_entry_id`
- **Counts** all completion instances for badge checking (not just unique challenges)

### Badge Logic
- Updated to count **each completion instance** (not just unique challenges)
- Multiple completions of the same challenge all count toward badge requirements
- Example: Completing "Apologize Sincerely" 3 times = 3 toward "Apology Ace" badge

## How It Works

1. **User clicks "+" button** on a challenge
2. **Modal opens** asking for optional notes
3. **User can check** "Save to journal" to create a journal entry
4. **On submit:**
   - Challenge completion is recorded (with notes)
   - If journal checkbox is checked and notes provided, a journal entry is created
   - Journal entry is linked to the completion
   - Badge eligibility is re-checked (counting all instances)
5. **UI updates** to show new completion count

## Example Use Case

**"Apology Ace" Badge** requires 3 apology actions:
- User completes "Apologize Sincerely" challenge 3 times
- Each completion can have notes: "Apologized for forgetting to take out trash"
- Each completion can be saved to journal
- After 3rd completion, badge is awarded
- All 3 completions are visible in journal (if saved)

## Next Steps

1. Run the SQL migration: `supabase/migrations/005_challenge_multiple_completions.sql`
2. Test completing the same challenge multiple times
3. Verify journal entries are created and linked
4. Verify badge counts work correctly with multiple completions


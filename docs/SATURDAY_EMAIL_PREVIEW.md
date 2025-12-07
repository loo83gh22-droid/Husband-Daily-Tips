# Saturday Email Preview

## Overview

Saturday emails are special check-in emails that:
1. Still include today's daily action (like other days)
2. **Additionally** check on the status of planning actions served on Monday
3. Show completion status for each of the 5 planning actions
4. Provide encouragement and next steps

## Email Structure

### Main Action Card
- Standard daily action card (same as other days)
- Title: "Weekend Check-In: How Are Your Planning Actions Going?"

### Planning Actions Status Section
- Shows all 5 planning actions from Monday
- Each action displays:
  - Name and description
  - Completion status (Completed / Not Started)
  - Visual indicator (green checkmark for completed, orange pending for incomplete)
  - Link to view details

### Summary Statistics
- Shows: X Completed / Y Remaining / 5 Total
- Visual summary at a glance

### Encouragement Messages
- **If some completed**: "You've got this! You still have Sunday to tackle the remaining ones."
- **If all completed**: "Amazing! You completed all planning actions! That's incredible initiative."
- **If none completed**: "That's okay—there's still time! Pick one that feels manageable and get started this weekend."

## Visual Preview

See `scripts/preview-saturday-email.html` for a full HTML preview.

## Implementation Notes

1. **7 Days a Week**: Premium users now receive emails 7 days a week (not just work days)
2. **Saturday Special Logic**: On Saturday, the email system will:
   - Get Monday's date (start of current week)
   - Query `user_weekly_planning_actions` for that week
   - Get the 5 action IDs
   - Check `user_daily_actions` to see which ones are completed
   - Generate status for each action
   - Include in email template

3. **Email Template**: New section in `lib/email.ts` for Saturday planning actions check-in

## User Experience

- **Accountability**: Gentle check-in without being pushy
- **Encouragement**: Positive messaging regardless of completion status
- **Actionable**: Clear links to view and complete remaining actions
- **Non-judgmental**: Acknowledges that planning actions take time


# Work Days Logic - How Non-Standard Schedules Are Handled

## Current Implementation

### How It Works

1. **`work_days` Field**: Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
   - Example: `[1,2,3,4,5]` = Monday through Friday
   - Example: `[1,3,5]` = Monday, Wednesday, Friday
   - Example: `[0,6]` = Sunday, Saturday
   - If `null` or empty: Defaults to `[1,2,3,4,5]` (Mon-Fri)

2. **Email Sending Logic**:
   - **Free users**: Email sent only on their **first work day** of the week
   - **Premium users**: Email sent **7 days a week** (Sunday-Saturday, days 0-6) regardless of work_days
     - This accommodates users with erratic schedules who may work any day
     - Saturday emails include special check-in on planning actions from Monday

3. **Action Selection Logic**:
   - Uses `work_days` to determine if a day is a "work day" or "day off"
   - Work days: Prefer `weekly_routine` actions (80% chance)
   - Days off: Prefer `planning_required` actions (70% chance)

## Examples

### Example 1: M, W, F Worker
- `work_days = [1, 3, 5]`
- **Free user**: Gets email on **Monday only** (first work day)
- **Premium user**: Gets emails **7 days a week** (Sunday-Saturday)
- **Action selection**: On Mon/Wed/Fri, prefers routine actions. On Tue/Thu/Sat/Sun, prefers planning actions.

### Example 2: Weekend Worker
- `work_days = [0, 6]` (Sunday, Saturday)
- **Free user**: Gets email on **Sunday only** (first work day)
- **Premium user**: Gets emails **7 days a week** (Sunday-Saturday)
- **Action selection**: On Sun/Sat, prefers routine actions. On Mon-Fri, prefers planning actions.

### Example 3: No work_days Set (Default)
- `work_days = null` or `[]`
- **Free user**: Gets email on **Monday** (default first work day)
- **Premium user**: Gets emails **7 days a week** (Sunday-Saturday)
- **Action selection**: Mon-Fri = routine actions, Sat-Sun = planning actions

## Current Limitations

### 1. Fluctuating Work Weeks
**Problem**: If someone's schedule changes week-to-week, they'd need to manually update `work_days` each week.

**Current Behavior**: 
- System uses the same `work_days` every week
- No automatic detection of schedule changes
- User must manually update in account settings

**Example**: 
- Week 1: Works Mon-Fri → `work_days = [1,2,3,4,5]`
- Week 2: Works Tue-Thu → User must update to `work_days = [2,3,4]`
- If they don't update: Still gets emails Mon-Fri (incorrect)

### 2. Incomplete Actions on Work Days
**Current Behavior**: 
- System sends emails on work days regardless of completion
- No penalty or adjustment if user doesn't complete actions
- If user works Mon-Fri but only completes actions Mon-Wed, they still get emails Thu-Fri

**Example**:
- User works Mon-Fri: `work_days = [1,2,3,4,5]`
- User completes actions Mon, Tue, Wed
- User doesn't complete Thu, Fri
- **Result**: Still gets emails Thu, Fri (no change)

### 3. Non-Standard Schedules
**Current Behavior**: 
- System fully supports non-standard schedules
- Just set `work_days` to the days they work
- Works correctly for any combination of days

**Example - M, W, F Worker**:
- `work_days = [1, 3, 5]`
- Premium user gets emails 7 days a week ✅
- Free user gets email Mon only ✅
- Action selection adapts correctly based on work_days ✅

## Proposed Improvements

### Option 1: Weekly Schedule Override
Allow users to set a different schedule for the current week:
- Add `current_week_work_days` field
- Resets to `work_days` at start of each week
- User can adjust for fluctuating schedules

### Option 2: Adaptive Email Frequency
If user consistently doesn't complete actions on certain days:
- Track completion rate per day of week
- Reduce email frequency on days with low completion
- Still send but less frequently

### Option 3: "Flexible Schedule" Mode
For users with truly fluctuating schedules:
- Option to receive emails 7 days a week
- User chooses which days to complete
- No work_days restriction

### Option 4: Keep Current (Simplest)
- Users update `work_days` when schedule changes
- System respects their work days
- No automatic adjustments

## Recommendation

**For now**: Keep current implementation (Option 4)
- Simple and predictable
- Users can update `work_days` when needed
- Works correctly for M, W, F and other non-standard schedules

**Future enhancement**: Add Option 3 (Flexible Schedule Mode)
- Premium users can opt into 7-day emails
- Especially useful for fluctuating schedules
- User maintains control

## Saturday Email Impact

With the new Saturday email feature:
- **Premium users with 7-day emails**: Get Saturday check-in email
- **Premium users with work_days only**: Only get Saturday email if Saturday is in their `work_days`
- **Recommendation**: For Saturday check-in to work for all premium users, we should send it regardless of `work_days` (special case for Saturday)


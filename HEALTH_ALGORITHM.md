# Health Score Algorithm - Updated Specification

## Overview
The health score reflects relationship health based on daily actions, consistency, and growth. Badges are achievement trackers only and do NOT affect health score.

## Components

### 1. Baseline Score (Initial Survey)
- Set from initial relationship survey
- Range: 0-100
- Review and adjust calculation later

### 2. Daily Action Points
Each action has a point value (1, 2, or 3):
- **1 point**: Basic/simple actions
- **2 points**: Moderate/meaningful actions  
- **3 points**: Significant/deep actions

**Point values need to be assigned to each action** (to be determined).

### 3. Daily Limits
- **Maximum 3 points per day** from actions
- **Maximum 15 points per week** (rolling 7-day window)
- If multiple actions completed in one day, only the highest value action counts (up to 3 points max)

### 4. 7-Day Event Completion Bonus
- **+3 points** when completing a 7-day event
- This bonus is separate from daily action points
- Can push daily total above 3 points (but weekly cap still applies)

### 5. Decay (Missed Days)
- **-2 points per missed day**
- Applied when a day passes without completing any action
- Health cannot go below 0

### 6. Action Repetition Penalty
To encourage variety and growth:

- If the same action is completed within 30 days of the previous completion:
  - **1st completion**: Full points (1, 2, or 3)
  - **2nd completion** (within 30 days): 1 less point (2→1, 1→0, 3→2)
  - **3rd completion** (within 30 days): 1 less point again (2→1, 1→0, 3→2)
  - Continues until 0 points
  - Cannot go negative (minimum 0 points)

- **Reset**: If an action hasn't been completed for 30+ days, the penalty resets and it earns full points again

**Example:**
- Day 1: Complete "Write Love Note" (3 points) → Get 3 points
- Day 14: Complete "Write Love Note" again → Get 2 points (penalty: -1)
- Day 28: Complete "Write Love Note" again → Get 1 point (penalty: -2)
- Day 42: Complete "Write Love Note" again → Get 0 points (penalty: -3, but can't go negative)
- Day 75: Complete "Write Love Note" (30+ days since last) → Get 3 points (reset)

### 7. Badges
- **Do NOT affect health score**
- Purely achievement trackers
- Show progress and accomplishments

## Calculation Flow

1. Start with baseline health (from survey)
2. For each day:
   - Check if action was completed
   - If yes: Calculate points (action value - repetition penalty, capped at 3/day)
   - If no: Apply -2 decay
3. Apply weekly cap (15 points max in rolling 7-day window)
4. Add 7-day event completion bonuses (+3 each)
5. Ensure health stays between 0-100

## Database Changes Needed

1. Add `health_point_value` column to `actions` table (1, 2, or 3)
2. Track action completion history with timestamps for repetition penalty
3. Track daily points earned (for daily cap)
4. Track weekly points earned (for weekly cap)
5. Track missed days (for decay)
6. Track 7-day event completions (for bonus)

## Implementation Notes

- Health calculation should run:
  - When action is completed
  - Daily (cron job) to apply decay for missed days
  - When 7-day event is completed


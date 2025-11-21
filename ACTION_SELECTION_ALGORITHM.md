# Daily Action Selection Algorithm

## Overview
The system uses a **personalized, data-driven approach** to select which action is delivered to each user every day. The algorithm considers multiple factors to ensure actions are relevant, non-repetitive, and targeted to areas where each user needs the most improvement.

---

## Decision-Making Process (Step-by-Step)

### 1. **Check for Existing Assignment** (Step 1)
**Priority: Highest**
- First, the system checks if the user already has an action assigned for tomorrow
- If yes, it returns that same action (ensures consistency)
- This happens in `getTomorrowAction()` function

```typescript
// Check if user has already seen tomorrow's action
const { data: existingAction } = await supabase
  .from('user_daily_actions')
  .select('*, actions(*)')
  .eq('user_id', userId)
  .eq('date', tomorrowStr)
  .single();

if (existingAction) {
  return existingAction.actions; // Return pre-assigned action
}
```

**Why?** This ensures users see the same action in the dashboard and email, and the action doesn't change throughout the day.

---

### 2. **30-Day Rotation Filter** (Step 2)
**Priority: High**
- Filters out actions the user has seen in the last 30 days
- Ensures variety and prevents repetition
- If a user has seen all actions in the last 30 days, the system falls back to showing any action

```typescript
// Get actions user has seen in the last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const { data: recentActions } = await supabase
  .from('user_daily_actions')
  .select('action_id')
  .eq('user_id', userId)
  .gte('date', thirtyDaysAgoStr);

// Filter out seen actions
actions = actions.filter((action) => !seenActionIds.includes(action.id));
```

**Why?** Keeps content fresh and ensures users don't see the same actions repeatedly in a short time period.

---

### 3. **Personalization Based on Survey Results** (Step 3)
**Priority: Medium-High (when available)**
- **Only applies if user has completed the onboarding survey**
- Uses category scores from the survey to identify areas needing improvement

#### How Category Scores Work:

The system tracks scores (0-100) for six relationship categories:
1. **Communication** - How well you communicate with your partner
2. **Romance** - Romantic gestures and date nights
3. **Partnership** - Working together as a team
4. **Intimacy** - Emotional and physical closeness
5. **Conflict** - How you handle disagreements (mapped to Communication)
6. **Connection** - Overall connection quality (mapped to Roommate Syndrome Recovery)

#### Personalization Logic:

```typescript
// Find lowest scoring category (where they need most improvement)
scores.sort((a, b) => a.score - b.score);
const lowestCategory = scores[0];
const targetCategory = categoryMapping[lowestCategory.category];

// Prioritize actions in the category where they need most improvement
const priorityActions = actions.filter((a) => a.category === targetCategory);
if (priorityActions.length > 0) {
  // 70% chance to pick from priority category, 30% random
  if (Math.random() < 0.7) {
    actions = priorityActions;
  }
}
```

**Decision Rule:**
- Identifies the category with the **lowest score** (weakest area)
- 70% chance to select an action from that category
- 30% chance to select randomly from all available actions

**Example:**
- User scores: Communication: 60, Romance: 40, Partnership: 70, Intimacy: 80
- **Lowest score: Romance (40)**
- **70% chance** to show a Romance action
- **30% chance** to show any random action (for variety)

**Why?** Personalizes content to address each user's specific relationship challenges while maintaining variety.

---

### 4. **Random Selection** (Step 4)
**Priority: Default**
- If no survey data exists, or after personalization filtering
- Randomly selects from available actions

```typescript
const randomAction = actions[Math.floor(Math.random() * actions.length)];
```

**Why?** Ensures fair distribution and variety when personalization data isn't available.

---

### 5. **Fallback** (Step 5)
**Priority: Last Resort**
- If no actions are available (all seen in last 30 days)
- System falls back to selecting from ALL actions in the database
- Prevents empty results

```typescript
if (!actions || actions.length === 0) {
  // Fallback: get any action anyway
  const { data: allActions } = await supabase
    .from('actions')
    .select('*')
    .limit(100);
  
  action = allActions[Math.floor(Math.random() * allActions.length)];
}
```

**Why?** Ensures users always receive an action, even if they've been very active.

---

## Category Mapping

The system maps survey categories to action categories:

| Survey Category | Action Category |
|----------------|-----------------|
| `communication` | `Communication` |
| `romance` | `Romance` |
| `partnership` | `Partnership` |
| `intimacy` | `Intimacy` |
| `conflict` | `Communication` (handled through Communication) |
| `connection` | `Roommate Syndrome Recovery` |

---

## Inputs Used in Decision-Making

### 1. **User Survey Data** (Primary Personalization Input)
- **Source:** `survey_summary` table
- **Stored:** After user completes onboarding survey
- **Contains:**
  - `baseline_health` (overall relationship health score)
  - `communication_score` (0-100)
  - `romance_score` (0-100)
  - `partnership_score` (0-100)
  - `intimacy_score` (0-100)
  - `conflict_score` (0-100)
  - `connection_score` (0-100, optional)

### 2. **User Action History** (Rotation Input)
- **Source:** `user_daily_actions` table
- **Used for:** Tracking which actions user has seen in last 30 days
- **Contains:** `user_id`, `action_id`, `date`, `completed`

### 3. **Available Actions** (Content Pool)
- **Source:** `actions` table
- **Contains:** All available actions with categories, descriptions, benefits

### 4. **Subscription Tier** (Currently Not Used)
- **Note:** All actions are currently available to all tiers
- **Future:** Could be used to filter premium/pro actions

---

## Example Scenarios

### Scenario 1: New User (No Survey)
1. No existing assignment → proceed
2. No 30-day history → all actions available
3. No survey data → skip personalization
4. Random selection from all actions

**Result:** Random action from entire pool

---

### Scenario 2: User with Survey (Low Romance Score)
1. No existing assignment → proceed
2. Filter out last 30 days → 45 actions available
3. Survey shows: Romance score = 35 (lowest)
4. Personalization: 70% chance to pick from Romance category
5. 12 Romance actions available
6. **70% chance:** Pick from 12 Romance actions
7. **30% chance:** Pick from all 45 actions

**Result:** Likely a Romance action (addresses weakest area)

---

### Scenario 3: Active User (Many Actions Seen)
1. No existing assignment → proceed
2. Filter out last 30 days → Only 3 actions available
3. Survey data exists → Personalize from those 3
4. If none match priority category → Random from 3
5. If no actions available → Fallback to all actions

**Result:** Action from remaining pool or fallback

---

### Scenario 4: Pre-Assigned Action
1. Check for tomorrow's action → **FOUND**
2. Return existing action

**Result:** Same action user saw earlier (consistency)

---

## Where the Algorithm is Used

1. **Dashboard** (`app/dashboard/page.tsx`)
   - Shows tomorrow's action to logged-in users
   - Uses `getTomorrowAction()` function

2. **Daily Action Email** (`app/api/email/send-daily-action/route.ts`)
   - Sends email at 7pm user's timezone
   - Uses same logic but doesn't include personalization (only rotation)

3. **Tomorrow's Tips Email** (`app/api/cron/send-tomorrow-tips/route.ts`)
   - Sends email at 12pm daily
   - Uses `sendTomorrowTipEmail()` which calls same logic
   - **Note:** Currently doesn't pass category scores

4. **Email Test Endpoint** (`app/api/email/test/route.ts`)
   - For testing email delivery

---

## Current Limitations & Future Improvements

### Current Limitations:
1. **Email cron jobs don't use personalization**
   - The email endpoints don't retrieve category scores
   - They only use 30-day rotation
   - Dashboard has full personalization

2. **70/30 split is hardcoded**
   - Could be made configurable
   - Could vary based on user preferences

3. **No time-based personalization**
   - Doesn't consider day of week
   - Doesn't consider relationship milestones
   - Doesn't consider seasonal events

4. **No feedback loop**
   - Doesn't learn from action completion rates
   - Doesn't adjust based on user engagement

### Potential Improvements:
1. **Add personalization to email endpoints**
   - Retrieve category scores in email cron jobs
   - Make emails as personalized as dashboard

2. **Dynamic weighting**
   - Adjust 70/30 split based on user behavior
   - More aggressive personalization for engaged users

3. **Feedback integration**
   - Boost actions with high completion rates
   - Reduce actions user marked as "not relevant"

4. **Temporal awareness**
   - Weekend-specific actions (date nights)
   - Anniversary reminders
   - Seasonal relationship tips

---

## Data Flow Diagram

```
User completes survey
    ↓
Survey scores saved to survey_summary table
    ↓
User visits dashboard OR email sent
    ↓
getTomorrowAction() called
    ↓
1. Check existing assignment? → Yes: Return it
    ↓ No
2. Get actions from last 30 days
    ↓
3. Filter out seen actions
    ↓
4. Get category scores from survey_summary
    ↓
5. Find lowest scoring category
    ↓
6. 70% chance: Filter to that category
    30% chance: Use all available actions
    ↓
7. Randomly select from filtered actions
    ↓
8. Save to user_daily_actions
    ↓
9. Return action to user
```

---

## Summary

The daily action selection uses a **multi-factor, personalized algorithm** that:
1. ✅ Prevents repetition (30-day rotation)
2. ✅ Personalizes based on survey results (70% of the time)
3. ✅ Maintains variety (30% random selection)
4. ✅ Ensures consistency (pre-assigned actions)
5. ✅ Always has a fallback (never empty results)

The system balances **personalization** (addressing weak areas) with **variety** (preventing monotony) to deliver relevant, engaging daily actions to each user.


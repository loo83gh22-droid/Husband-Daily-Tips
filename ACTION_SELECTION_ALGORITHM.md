# Action Selection Algorithm - Complete Breakdown

## Overview

The action selection algorithm uses a **combined weighted system** that personalizes action recommendations based on:
1. **Survey data** (initial user assessment)
2. **User preferences** ("Show me more like this" clicks)
3. **Base variety** (ensures users see diverse actions)

---

## Algorithm Flow

### Step 1: Filter Available Actions

**Exclusions:**
- Actions seen in the last 30 days
- Actions the user has hidden ("Don't show me this again")
- Actions filtered by user profile (e.g., kid-related actions if user has no kids)

**Result:** A pool of eligible actions to choose from

---

### Step 2: Calculate Category Weights

The algorithm calculates weights for each category using three components:

#### Component 1: Base Weight
- **Value:** `1.0` for all categories
- **Purpose:** Ensures every category has a chance to be selected, maintaining variety

#### Component 2: Survey Weight
- **Value:** `+2.0` for survey priority categories
- **How it's determined:**
  1. **Priority 1:** Categories where user rated themselves 1-3 (low) AND wants improvement
  2. **Priority 2:** If no goal preferences, uses category scores (lowest score = needs most improvement)
- **Purpose:** Initial personalization based on user's self-assessment

#### Component 3: User Preference Weight
- **Value:** `+0.5` per "Show me more like this" click
- **Maximum:** `+3.0` (6 clicks total)
- **Purpose:** Allows users to refine recommendations based on what actually works for them

#### Final Weight Formula
```
Final Category Weight = Base Weight + Survey Weight + User Preference Weight
```

---

### Step 3: Weighted Random Selection

**Process:**
1. Group all eligible actions by category
2. Calculate total weight: `sum of all category weights`
3. Generate random number: `0 to total_weight`
4. Iterate through categories, subtracting each weight until random number ≤ 0
5. Select the category where the random number falls
6. Randomly pick one action from that category

**Example:**
- Communication: weight 3.0
- Romance: weight 2.5
- Partnership: weight 1.5
- Others: weight 1.0 each

Total weight = 3.0 + 2.5 + 1.5 + (6 × 1.0) = 13.0

If random number = 4.2:
- Subtract Communication (3.0) → 1.2
- Subtract Romance (2.5) → -1.3 (falls here!)
- **Result:** Romance category selected

---

## Real-World Example

### User Profile
- **Survey Results:**
  - Communication: Self-rating 2, wants improvement → Survey priority
  - Romance: Self-rating 4, no improvement needed
  - Partnership: Self-rating 3, wants improvement → Survey priority

- **User Behavior:**
  - Clicks "Show me more like this" on Romance 3 times
  - Clicks "Show me more like this" on Gratitude 1 time

### Weight Calculation

| Category | Base | Survey | User Pref | **Final Weight** |
|----------|------|--------|-----------|------------------|
| Communication | 1.0 | 2.0 | 0 | **3.0** |
| Partnership | 1.0 | 2.0 | 0 | **3.0** |
| Romance | 1.0 | 0 | 1.5 | **2.5** |
| Gratitude | 1.0 | 0 | 0.5 | **1.5** |
| Intimacy | 1.0 | 0 | 0 | **1.0** |
| Conflict Resolution | 1.0 | 0 | 0 | **1.0** |
| Reconnection | 1.0 | 0 | 0 | **1.0** |
| Quality Time | 1.0 | 0 | 0 | **1.0** |

**Total Weight:** 13.0

### Selection Probabilities

- **Communication:** 3.0 / 13.0 = **23.1%**
- **Partnership:** 3.0 / 13.0 = **23.1%**
- **Romance:** 2.5 / 13.0 = **19.2%**
- **Gratitude:** 1.5 / 13.0 = **11.5%**
- **Each other category:** 1.0 / 13.0 = **7.7%**

### What This Means

- User will see **Communication** and **Partnership** actions most often (survey priorities)
- **Romance** actions will appear frequently (user preference)
- **Gratitude** actions will appear occasionally (user preference)
- Other categories still appear, maintaining variety

---

## Key Features

### 1. **Balanced Personalization**
- Survey provides initial guidance
- User preferences refine over time
- Base weight ensures variety

### 2. **Cumulative Learning**
- Each "Show me more like this" click increases preference
- Multiple clicks = stronger preference
- Max weight prevents over-specialization

### 3. **Dynamic Adaptation**
- Algorithm adapts as user clicks "show me more"
- Preferences can override survey if user discovers what works
- System learns from user behavior

### 4. **Variety Preservation**
- Even preferred categories don't dominate 100%
- Other categories still appear (7-23% chance each)
- Prevents action fatigue

---

## Where This Algorithm Is Used

1. **Daily Actions** (`app/dashboard/page.tsx`)
   - Tomorrow's action selection
   - Main user experience

2. **Challenge Actions** (`app/api/challenges/join/route.ts`)
   - Actions assigned when joining challenges
   - Uses same weighted system

3. **Weekly Assignments** (`app/api/actions/assign-week/route.ts`)
   - Pre-assigned weekly actions
   - Consistent personalization

---

## Weight Limits & Caps

- **User Preference Weight:** Maximum 3.0 (6 clicks)
- **Survey Weight:** Maximum 2.0 (one priority category)
- **Base Weight:** Always 1.0 (cannot be changed)
- **Maximum Possible Weight:** 6.0 (base 1.0 + survey 2.0 + user pref 3.0)

**Why caps?**
- Prevents one category from dominating completely
- Maintains variety and prevents action fatigue
- Ensures users see diverse content

---

## Algorithm Priority Order

When multiple signals exist, the algorithm combines them:

1. **Survey Priority** (if user completed survey)
   - Highest initial weight boost (+2.0)
   - Based on self-assessment

2. **User Preferences** (from "Show me more" clicks)
   - Can override or complement survey
   - Builds over time (+0.5 per click)

3. **Base Variety** (always present)
   - Ensures all categories have a chance
   - Prevents complete specialization

---

## Technical Implementation

### Database Tables Used
- `user_category_preferences` - Stores user preference weights
- `survey_summary` - Stores survey results and goal preferences
- `user_hidden_actions` - Tracks hidden actions (excluded from selection)
- `user_daily_actions` - Tracks seen actions (excluded for 30 days)

### Key Functions
- `increment_category_preference()` - Database function to safely increment weights
- Weighted random selection - JavaScript implementation in selection logic

---

## Summary

The algorithm creates a **personalized, adaptive, and balanced** action recommendation system that:
- ✅ Starts with survey-based guidance
- ✅ Learns from user behavior
- ✅ Maintains variety
- ✅ Adapts over time
- ✅ Respects user preferences (both positive and negative)

This ensures users get actions that are both **relevant to their needs** and **diverse enough to keep engagement high**.

# Husband Health Score - 3 Scoring Algorithm Options

## Current System Overview
- **Baseline**: From initial survey (0-100)
- **Daily Routine Actions**: Quick actions users can do today
- **Weekly Planning Actions**: Actions requiring more planning/thought
- **7-Day Events**: Special challenges that span a week
- **Badges**: Do NOT affect scoring (reference only)

## Requirements
- Focus on **consistency** over speed
- Score should **not change too rapidly** (up or down)
- Account for **weekly actions** separately from daily
- Account for **daily actions**
- Badges don't contribute to score

---

## Option 1: Conservative & Steady (Recommended for Consistency Focus)

**Philosophy**: Slow, steady progress. Rewards consistency over speed. Small daily gains, meaningful weekly gains.

### Scoring Breakdown:

**Baseline (Starting Point)**
- From initial survey: 0-100
- This is your foundation

**Daily Routine Actions**
- **Points per action**: +0.5 points per completed daily action
- **Daily cap**: Max 1.0 point per day (even if multiple actions completed)
- **Rationale**: Small, consistent daily progress. Completing your daily action is the baseline expectation.

**Weekly Planning Actions**
- **Points per action**: +2.0 points per completed weekly action
- **Weekly cap**: Max 2.0 points per week (one weekly action = full weekly credit)
- **Rationale**: Weekly actions require more planning and effort, so they're worth more. One per week is the goal.

**7-Day Events**
- **Bonus points**: +3.0 points per completed event
- **Rationale**: These are special achievements that span a week, so they deserve recognition.

**Decay (Missed Days)**
- **Decay rate**: -0.5 points per missed day (no action completed)
- **Decay cap**: Max -3.5 points per week (7 missed days)
- **Rationale**: Slow decay encourages getting back on track. Missing a few days won't tank your score.

**Score Range**: 0-100 (clamped)

### Example Calculation:
- Baseline: 60
- 7 days of daily actions: +7.0 points (1.0 per day × 7)
- 1 weekly action: +2.0 points
- 1 missed day: -0.5 points
- **Total**: 68.5

### Pros:
- ✅ Very stable - score changes slowly
- ✅ Rewards consistency (daily actions add up)
- ✅ Weekly actions feel meaningful
- ✅ Hard to "game" - requires sustained effort

### Cons:
- ⚠️ May feel slow for users who want faster feedback
- ⚠️ Takes longer to see significant improvement

---

## Option 2: Balanced Approach (Moderate Changes)

**Philosophy**: Balanced rewards for daily and weekly actions. Moderate speed of change.

### Scoring Breakdown:

**Baseline (Starting Point)**
- From initial survey: 0-100

**Daily Routine Actions**
- **Points per action**: +0.8 points per completed daily action
- **Daily cap**: Max 1.5 points per day
- **Rationale**: Daily actions are important but shouldn't dominate. Allows for doing extra actions occasionally.

**Weekly Planning Actions**
- **Points per action**: +3.0 points per completed weekly action
- **Weekly cap**: Max 3.0 points per week
- **Rationale**: Weekly actions are significant commitments and should be rewarded accordingly.

**7-Day Events**
- **Bonus points**: +4.0 points per completed event
- **Rationale**: Special achievements deserve meaningful recognition.

**Decay (Missed Days)**
- **Decay rate**: -0.8 points per missed day
- **Decay cap**: Max -5.6 points per week (7 missed days)
- **Rationale**: Moderate decay - missing days has consequences but isn't devastating.

**Score Range**: 0-100 (clamped)

### Example Calculation:
- Baseline: 60
- 7 days of daily actions: +10.5 points (1.5 per day × 7, capped)
- 1 weekly action: +3.0 points
- 2 missed days: -1.6 points
- **Total**: 71.9

### Pros:
- ✅ Balanced between daily and weekly importance
- ✅ Moderate speed - visible progress without being too fast
- ✅ Rewards both consistency and planning
- ✅ Good middle ground

### Cons:
- ⚠️ May still feel slow for some users
- ⚠️ Decay might feel harsh if you miss several days

---

## Option 3: Progressive Consistency (Rewards Sustained Effort)

**Philosophy**: Rewards consistency with progressive bonuses. The longer you maintain consistency, the more valuable your actions become.

### Scoring Breakdown:

**Baseline (Starting Point)**
- From initial survey: 0-100

**Daily Routine Actions**
- **Base points**: +0.6 points per completed daily action
- **Consistency bonus**: +0.1 points per consecutive day (max +0.5 bonus)
  - Day 1-2: +0.6 points
  - Day 3-4: +0.7 points
  - Day 5-6: +0.8 points
  - Day 7+: +1.1 points (0.6 base + 0.5 bonus)
- **Daily cap**: Max 1.1 points per day
- **Rationale**: Rewards sustained daily effort. The longer your streak, the more each day is worth.

**Weekly Planning Actions**
- **Base points**: +2.5 points per completed weekly action
- **Weekly consistency bonus**: +0.5 points if you completed last week's action (max +1.0 bonus)
  - First weekly action: +2.5 points
  - Consecutive weeks: +3.0 points (2.5 base + 0.5 bonus)
- **Weekly cap**: Max 3.0 points per week
- **Rationale**: Rewards planning consistency. Completing weekly actions week after week is valuable.

**7-Day Events**
- **Bonus points**: +3.5 points per completed event
- **Rationale**: Special achievements that require sustained effort over a week.

**Decay (Missed Days)**
- **Decay rate**: -0.6 points per missed day
- **Consistency reset**: Missing a day resets your daily consistency bonus
- **Decay cap**: Max -4.2 points per week (7 missed days)
- **Rationale**: Moderate decay, but missing a day resets your bonus progress, encouraging consistency.

**Score Range**: 0-100 (clamped)

### Example Calculation:
- Baseline: 60
- 7 consecutive days of daily actions: 
  - Days 1-2: +1.2 (0.6 × 2)
  - Days 3-4: +1.4 (0.7 × 2)
  - Days 5-6: +1.6 (0.8 × 2)
  - Day 7: +1.1 (0.6 + 0.5 bonus)
  - Total: +5.3 points
- 1 weekly action (first time): +2.5 points
- **Total**: 67.8

### Pros:
- ✅ Strongly rewards consistency
- ✅ Gamifies sustained effort
- ✅ Makes streaks more meaningful
- ✅ Progressive rewards feel rewarding

### Cons:
- ⚠️ More complex to explain
- ⚠️ Missing a day feels more punishing (loses bonus progress)
- ⚠️ May create pressure to maintain streaks

---

## Comparison Summary

| Feature | Option 1: Conservative | Option 2: Balanced | Option 3: Progressive |
|---------|----------------------|-------------------|---------------------|
| **Daily Action Value** | +0.5/day (max 1.0) | +0.8/day (max 1.5) | +0.6-1.1/day (progressive) |
| **Weekly Action Value** | +2.0/week | +3.0/week | +2.5-3.0/week (progressive) |
| **7-Day Event Bonus** | +3.0 | +4.0 | +3.5 |
| **Decay Rate** | -0.5/day | -0.8/day | -0.6/day |
| **Speed of Change** | Very Slow | Moderate | Moderate-Slow |
| **Consistency Focus** | High | Medium | Very High |
| **Complexity** | Simple | Simple | Moderate |

---

## Recommendation

**For your stated goals (consistency focus, not too fast changes):**

I recommend **Option 1: Conservative & Steady** because:
1. ✅ Emphasizes consistency over speed
2. ✅ Score changes slowly (won't jump around)
3. ✅ Simple to understand and explain
4. ✅ Weekly actions feel meaningful (+2.0 points)
5. ✅ Daily actions reward consistency (+0.5/day)
6. ✅ Gentle decay encourages getting back on track

**Alternative**: If you want to reward consistency more aggressively, **Option 3** is great, but it's more complex.

---

## Implementation Notes

- All options use the baseline as the foundation
- Weekly actions are tracked separately from daily actions
- 7-day events are tracked separately
- Decay only applies when NO action is completed that day
- Badges remain purely for reference (no scoring impact)
- Score is always clamped between 0-100


# Health Score Calculation Guide

## Current Formula (Before Unique Action Bonus)

### Base Score Components

1. **Streak Component** (up to 70 points)
   - Formula: `min(currentStreak * 8, 70)`
   - Example: 5 day streak = 40 points, 10 day streak = 70 points (capped)

2. **History Component** (up to 30 points)
   - Formula: `min(totalTips * 2, 30)`
   - Example: 10 total tips = 20 points, 20 total tips = 30 points (capped)

3. **Base Score**: `baseFromStreak + fromHistory`
   - Maximum base: 100 points (70 + 30)

### Decay Penalty

- **Trigger**: If last action was more than 2 days ago
- **Formula**: `decayPenalty = min((daysSinceLastAction - 2) * 2, baseScore)`
- **Applied**: `baseScore = max(0, baseScore - decayPenalty)`
- **Example**: 
  - Last action 5 days ago: decay = (5-2) * 2 = 6 points lost
  - Last action 10 days ago: decay = (10-2) * 2 = 16 points lost

### Badge Bonuses

- **Type**: Permanent health boosts
- **Applied**: Added to base score after decay
- **Formula**: `finalScore = min(100, baseScore + badgeBonuses)`
- **Capped**: Maximum health is 100

### Final Score

- **Range**: 0-100
- **Formula**: `max(0, min(100, baseScore + badgeBonuses))`

---

## Proposed Formula (With Unique Action Bonus)

### New Components

1. **Streak Component** (up to 50 points) - Reduced from 70
   - Formula: `min(currentStreak * 6, 50)`
   - Still rewards consistency but less dominant

2. **History Component** (up to 20 points) - Reduced from 30
   - Formula: `min(totalTips * 1.5, 20)`
   - Rewards overall activity

3. **Unique Actions Bonus** (up to 30 points) - NEW
   - Formula: `min(uniqueActionCount * 3, 30)`
   - Rewards trying different actions
   - Counts unique tips completed + unique challenges completed
   - Example: 10 unique actions = 30 points (capped)

4. **Base Score**: `baseFromStreak + fromHistory + uniqueActionsBonus`
   - Maximum base: 100 points (50 + 20 + 30)

### Decay Penalty (Same)

- Still applies if last action > 2 days ago
- Same formula: `decayPenalty = min((daysSinceLastAction - 2) * 2, baseScore)`

### Badge Bonuses (Same)

- Permanent boosts added after decay
- Capped at 100 total

### Example Calculations

**Scenario 1: User with 7 day streak, 15 total tips, 12 unique actions**
- Streak: min(7 * 6, 50) = 42
- History: min(15 * 1.5, 20) = 20
- Unique: min(12 * 3, 30) = 30
- Base: 42 + 20 + 30 = 92
- Badge bonus: +10
- Final: min(100, 92 + 10) = 100

**Scenario 2: User repeating same action 20 times, 5 day streak, 5 unique actions**
- Streak: min(5 * 6, 50) = 30
- History: min(20 * 1.5, 20) = 20
- Unique: min(5 * 3, 30) = 15
- Base: 30 + 20 + 15 = 65
- Badge bonus: +5
- Final: min(100, 65 + 5) = 70

**Scenario 3: User with variety, 3 day streak, 8 total tips, 8 unique actions**
- Streak: min(3 * 6, 50) = 18
- History: min(8 * 1.5, 20) = 12
- Unique: min(8 * 3, 30) = 24
- Base: 18 + 12 + 24 = 54
- Badge bonus: +0
- Final: 54

---

## Benefits of New Formula

1. **Encourages Variety**: Users get rewarded for trying different actions
2. **Prevents Gaming**: Can't just repeat the same easy action
3. **Balanced**: Still rewards consistency (streak) and activity (history)
4. **Motivates Exploration**: Users will try new actions to maximize health

---

## Implementation Notes

- Need to track unique tips completed per user
- Need to track unique challenges completed per user
- Combine both for unique action count
- Update `calculateHealthScore` function in `lib/health.ts`
- Update `getUserStats` to include unique action count


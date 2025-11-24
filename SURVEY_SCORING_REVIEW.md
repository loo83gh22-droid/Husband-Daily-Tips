# Initial Survey and Baseline Health Scoring Review

## Current Survey Structure

### Questions 1-13: Initial Assessment (Baseline Health)
**Total: 13 questions**

#### Questions 1-2: Generic/Happiness (Communication category)
- Q1: "I am satisfied with my relationship overall" (scale 1-5)
- Q2: "I feel happy and fulfilled in my relationship" (scale 1-5)

#### Questions 3-4: Communication
- Q3: "My partner and I communicate well with each other" (scale 1-5)
- Q4: "I feel comfortable expressing my feelings to my partner" (scale 1-5)

#### Questions 5-6: Romance
- Q5: "I regularly show romantic gestures and affection to my partner" (scale 1-5)
- Q6: "We make time for date nights and quality time together" (scale 1-5)

#### Questions 7-8: Intimacy
- Q7: "We have a strong emotional and physical connection" (scale 1-5)
- Q8: "I feel emotionally close and connected to my partner" (scale 1-5)

#### Questions 9-10: Partnership
- Q9: "We work well together as a team in our relationship" (scale 1-5)
- Q10: "I actively participate in activities and experiences with my partner" (scale 1-5)

#### Questions 11-13: Connection (Roommate Syndrome)
- Q11: "I feel like my partner and I are more like roommates than romantic partners" (scale 1-5)
- Q12: "We have meaningful conversations regularly (not just logistics)" (scale 1-5)
- Q13: "I feel emotionally connected and close to my partner" (scale 1-5)

### Questions 14-29: Goal-Setting (NEW - Not used for baseline)
**Total: 16 questions** (8 categories × 2 questions each)
- Self-rating: "How [Category] are you?" (1-5 scale)
- Improvement desire: "Would you like to improve it?" (yes/no)

## Current Baseline Health Calculation

### Step 1: Calculate Category Averages
For each category, calculate the average of all responses (1-5 scale):
- **Communication**: Average of Q1, Q2, Q3, Q4 (4 questions)
- **Romance**: Average of Q5, Q6 (2 questions)
- **Intimacy**: Average of Q7, Q8 (2 questions)
- **Partnership**: Average of Q9, Q10 (2 questions)
- **Conflict**: No questions → Uses average of Communication, Romance, Partnership, Intimacy
- **Connection**: Average of Q11, Q12, Q13 (3 questions)

### Step 2: Scale to 0-100
Each category score = `(average × 20)`
- Example: Average of 3.5 → 3.5 × 20 = 70 points

### Step 3: Calculate Baseline Health
Baseline Health = Average of all 6 category scores:
```
(Communication + Romance + Partnership + Intimacy + Conflict + Connection) / 6
```

## Example Calculation

**User Responses:**
- Communication (Q1-Q4): 4, 4, 3, 3 → Average = 3.5 → Score = 70
- Romance (Q5-Q6): 3, 3 → Average = 3.0 → Score = 60
- Intimacy (Q7-Q8): 4, 4 → Average = 4.0 → Score = 80
- Partnership (Q9-Q10): 3, 3 → Average = 3.0 → Score = 60
- Conflict: (70 + 60 + 80 + 60) / 4 = 67.5
- Connection (Q11-Q13): 2, 3, 3 → Average = 2.67 → Score = 53.4

**Baseline Health:**
(70 + 60 + 80 + 60 + 67.5 + 53.4) / 6 = **65.15** (rounded to **65**)

## Issues to Consider

### 1. **Question Distribution Imbalance**
- Communication: 4 questions (heavily weighted)
- Romance, Intimacy, Partnership: 2 questions each
- Connection: 3 questions
- Conflict: 0 questions (uses average)

**Impact:** Communication category has more influence on baseline health.

### 2. **Scale Interpretation**
- 1 = Strongly Disagree
- 2 = Disagree
- 3 = Neutral
- 4 = Agree
- 5 = Strongly Agree

**Note:** Q11 is reverse-scored (roommate feeling = bad), but currently treated the same as others.

### 3. **Missing Categories**
- No Gratitude questions in baseline
- No Conflict Resolution questions in baseline
- No Quality Time questions in baseline

### 4. **Goal-Setting Questions Not Used**
- Questions 14-29 (goal-setting) are NOT included in baseline calculation
- They're only used for action prioritization

## Recommendations for Review

1. **Should Q11 be reverse-scored?** (Roommate feeling = negative)
2. **Should we rebalance question distribution?** (Equal questions per category?)
3. **Should Conflict have its own questions?** (Instead of averaging)
4. **Should goal-setting self-ratings influence baseline?** (Currently they don't)
5. **What should the default baseline be?** (Currently 50 if no survey completed)

## Current Code Location
- Survey questions: `supabase/migrations/015_expand_to_10_question_survey.sql` + `016_add_roommate_syndrome_survey_and_actions.sql`
- Scoring logic: `app/api/survey/submit/route.ts` (lines 91-145)


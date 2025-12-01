# Birthday Email Example for waterloo1983

## Date Calculation

Based on the test data migration (`093_setup_birthday_test_data.sql`), the spouse birthday is set to **7 days from today**.

### Example Scenario (assuming today is Monday, December 2, 2024):

- **Today**: Monday, December 2, 2024
- **Spouse Birthday**: Monday, December 9, 2024 (7 days from today)
- **Birthday Day of Week**: Monday (Day 1)

### Birthday Week Logic:

Since the birthday falls on **Monday (Day 1)**, which is Day 0-4 (Sunday-Thursday), the birthday week starts on **Monday of the week BEFORE**.

- **Birthday Week Start**: Monday, December 2, 2024 (today!)
- **Birthday Week End**: Sunday, December 8, 2024
- **Birthday Date**: Monday, December 9, 2024

### When Email is Sent:

The email is sent at **12pm (noon)** in the user's timezone. Since today (Dec 2) is the start of birthday week, the user will receive an email **today at 12pm** containing **tomorrow's action** (Dec 3), which will be a **birthday planning action**.

---

## Example Email Content

**Subject:** `Tomorrow: Make Her Smile (Here's How)`

**Sent:** Monday, December 2, 2024 at 12:00 PM (user's timezone)

**Email Body:**

```
Best Husband Ever
Your daily action, delivered.

┌─────────────────────────────────────────┐
│  Romance                                 │
│                                          │
│  Plan a Surprise Birthday Party          │
│                                          │
│  Organize a surprise birthday party     │
│  for your spouse. Coordinate with       │
│  friends and family, choose a venue,    │
│  plan the menu, and create a            │
│  memorable celebration. Start planning │
│  at least a week in advance.            │
│                                          │
│  💡 Surprise parties show                │
│  thoughtfulness and effort. Planning    │
│  ahead demonstrates you care enough     │
│  to coordinate something special. The   │
│  joy on their face makes all the        │
│  planning worth it.                     │
│                                          │
│  [View in Dashboard →]                  │
└─────────────────────────────────────────┘

Here's the deal:
Tomorrow's action arrives today at 12pm. Why? 
Because winners plan ahead, and that's what 
you're becoming. Plus, it gives you time to 
actually make it happen. No scrambling, no 
forgetting, just execution. You got this.

[View in Dashboard →]
[Download Tomorrow's Action]
[Download 7 Days]

You're getting this because you signed up for 
Best Husband Ever. Your daily action, delivered.

View Dashboard | Manage Preferences
```

---

## Possible Birthday Actions

During the birthday week (Dec 2-8), the user will receive one of these 8 birthday planning actions each day:

1. **Plan a Surprise Birthday Party** (3 points)
2. **Book a Weekend Getaway** (3 points)
3. **Plan a Special Birthday Dinner** (2 points)
4. **Organize a Birthday Experience** (2 points)
5. **Create a Birthday Scavenger Hunt** (2 points)
6. **Plan a Birthday Celebration with Friends** (2 points)
7. **Arrange a Birthday Photo Shoot** (1 point)
8. **Plan a Birthday Staycation** (1 point)

---

## Important Notes

1. **Email Timing**: The email is sent at 12pm (noon) in the user's timezone, containing tomorrow's action.

2. **Birthday Week Duration**: Birthday actions are served for 7 days (Monday through Sunday) leading up to the birthday.

3. **Action Selection**: Each day during birthday week, one random birthday action is selected from the 8 available options (excluding ones seen in the last 30 days).

4. **Planning Time**: The system ensures users get at least a week of planning time:
   - If birthday is Friday/Saturday → actions start Monday of that week
   - If birthday is Sunday-Thursday → actions start Monday of the week BEFORE

5. **Test Data**: To test with a different date, update the `spouse_birthday` in the database for waterloo1983 user.

---

## To Test Locally

1. Run the migration: `093_setup_birthday_test_data.sql`
2. Verify the user's `spouse_birthday` is set correctly
3. Check if today falls within the calculated birthday week
4. If yes, the next email at 12pm will contain a birthday action
5. View the dashboard to see the birthday action displayed


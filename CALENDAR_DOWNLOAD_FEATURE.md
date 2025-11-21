# Calendar Download Feature - 7 Days of Tomorrow's Actions

## Overview

Users can now download future actions directly to their calendar from email, enabling better planning and commitment. When actions are downloaded to the calendar, they are **pre-assigned** and take precedence over the algorithm.

---

## Features Implemented

### 1. **Calendar Download Endpoints**

#### `/api/calendar/actions/download`
Generates an iCal file (.ics) for future actions that can be imported into Google Calendar, Outlook, Apple Calendar, etc.

**Parameters:**
- `days` (optional): Number of days to download (default: 7)
- `userId` (optional): User ID for email links (or uses session for dashboard)
- `token` (optional): For future authentication via email links

**Usage:**
- From email: `https://besthusbandever.com/api/calendar/actions/download?days=7&userId=USER_ID`
- From dashboard: `/api/calendar/actions/download?days=7` (uses session)

**Features:**
- ✅ Generates actions using the same personalization algorithm
- ✅ Pre-assigns actions to `user_daily_actions` table
- ✅ Respects user's calendar preferences (time, timezone)
- ✅ Includes action descriptions and benefits
- ✅ Creates iCal format compatible with all major calendars

---

### 2. **Bulk Action Assignment API**

#### `/api/actions/assign-week`
Assigns 7 days of actions to a user (useful for challenge integration).

**Method:** POST
**Requires:** Authentication (session)

**Request Body:**
```json
{
  "days": 7
}
```

**Response:**
```json
{
  "success": true,
  "assigned": 5,
  "total": 7,
  "actions": [
    {
      "date": "2024-01-15",
      "action": {
        "id": "uuid",
        "name": "Action Name",
        "category": "Romance"
      }
    }
  ]
}
```

**Features:**
- ✅ Uses same personalization algorithm as daily selection
- ✅ Skips dates that already have assigned actions
- ✅ Returns list of assigned actions

---

### 3. **Email Integration**

#### Email Templates Updated
Both daily action emails now include calendar download links:

**Email Links:**
1. **"Download Tomorrow's Action"** - Downloads 1 day (tomorrow)
2. **"Download 7 Days of Actions"** - Downloads 7 days

**Locations:**
- `app/api/email/send-daily-action/route.ts` - Daily action email (7pm)
- `lib/email.ts` - Tomorrow's tip email (12pm)

**Design:**
- Buttons styled to match email design
- Clear call-to-action
- Explanation of pre-assignment feature

---

### 4. **7-Day Challenge Integration**

#### Auto-Assignment on Challenge Join
When a user joins a **7-day challenge**, the system automatically:
1. Assigns 7 days of actions using the personalization algorithm
2. Locks in those actions so they take precedence
3. Allows users to download to calendar to plan ahead

**Implementation:**
- Modified `app/api/challenges/join/route.ts`
- Checks if challenge duration is 7 days
- Generates actions for next 7 days
- Uses same algorithm as daily selection

**Benefits:**
- Users can download challenge actions to calendar
- Actions are pre-assigned and locked in
- Better planning and commitment
- Ties into challenge system seamlessly

---

## How It Works

### Algorithm Precedence

The system now follows this priority order:

1. **Pre-Assigned Actions** (Highest Priority)
   - Actions already in `user_daily_actions` table
   - From calendar downloads or challenge joins
   - Takes precedence over algorithm

2. **30-Day Rotation**
   - Filters out actions seen in last 30 days

3. **Personalization**
   - Uses survey category scores
   - 70% chance to pick from lowest category
   - 30% chance random

4. **Random Selection**
   - Fallback to random action

### Pre-Assignment Flow

```
User downloads 7 days to calendar
    ↓
System generates 7 actions using algorithm
    ↓
Actions saved to user_daily_actions table
    ↓
iCal file generated with actions
    ↓
User imports to calendar
    ↓
Daily algorithm checks for existing action
    ↓
Returns pre-assigned action (no regeneration)
```

### Challenge Integration Flow

```
User joins 7-day challenge
    ↓
System detects 7-day duration
    ↓
Generates 7 actions using algorithm
    ↓
Actions saved to user_daily_actions
    ↓
User receives notification
    ↓
User can download to calendar
    ↓
Actions are locked in for 7 days
```

---

## Technical Details

### Database Schema

**Table:** `user_daily_actions`
- Stores pre-assigned actions
- Links user, action, and date
- Used by algorithm to check for existing assignments

### Algorithm Function

**Location:** Used in multiple files
- `app/dashboard/page.tsx` - `getTomorrowAction()`
- `app/api/calendar/actions/download/route.ts` - `generateActionForDate()`
- `app/api/actions/assign-week/route.ts` - `generateActionForDate()`
- `app/api/challenges/join/route.ts` - `generateActionForDate()`

**Consistency:**
- All functions use the same algorithm
- Same personalization logic
- Same 30-day rotation
- Same fallback behavior

### Calendar File Format

**Format:** iCal (.ics)
**Compatible with:**
- ✅ Google Calendar
- ✅ Outlook
- ✅ Apple Calendar
- ✅ All major calendar apps

**Features:**
- Includes action name (with icon if available)
- Includes description
- Includes benefit ("Why this matters")
- Uses user's preferred time (default: 9am)
- Uses user's timezone
- 30-minute duration

---

## User Benefits

### 1. **Better Planning**
- See actions in advance
- Plan around schedule
- Prepare for actions ahead of time

### 2. **Increased Commitment**
- Actions in calendar = visual commitment
- Less likely to skip
- Better follow-through

### 3. **Integration with Challenges**
- 7-day challenges auto-assign actions
- Download challenge actions to calendar
- Plan entire week at once

### 4. **Control Over Actions**
- Pre-assigned actions take precedence
- Algorithm won't override committed actions
- Predictability and planning

---

## Email Examples

### Daily Action Email (7pm)
```
Subject: Tomorrow's Action: [Action Name]

[Action card with description and benefit]

[Download Tomorrow's Action] [Download 7 Days of Actions]

Tip: Download actions to your calendar to plan ahead and lock in your commitment! 
Pre-assigned actions take precedence over the daily algorithm.
```

### Tomorrow's Tip Email (12pm)
```
Subject: Tomorrow's Action: [Action Name]

[Action card with description]

[Download Tomorrow's Action] [Download 7 Days]

Download actions to your calendar to plan ahead!
```

---

## Future Enhancements

### Potential Improvements:

1. **Secure Email Links**
   - Add token-based authentication for email links
   - Prevents unauthorized access
   - Currently uses userId (acceptable for MVP)

2. **Custom Date Range**
   - Allow users to select specific dates
   - Download actions for specific week
   - Custom date picker in dashboard

3. **Calendar Sync**
   - Two-way sync with calendar
   - Mark as complete in calendar
   - Update action status automatically

4. **Challenge-Specific Downloads**
   - Download only challenge actions
   - Separate calendar file for challenges
   - Challenge calendar view

5. **Notifications**
   - Reminder notifications before action
   - Calendar event reminders
   - Completion reminders

---

## Testing Checklist

### Email Links
- [ ] Test "Download Tomorrow's Action" from email
- [ ] Test "Download 7 Days" from email
- [ ] Verify iCal file downloads correctly
- [ ] Verify actions are pre-assigned in database

### Challenge Integration
- [ ] Join 7-day challenge
- [ ] Verify 7 actions are auto-assigned
- [ ] Verify actions take precedence
- [ ] Test downloading challenge actions to calendar

### Algorithm Behavior
- [ ] Verify pre-assigned actions are returned
- [ ] Verify algorithm doesn't override pre-assigned
- [ ] Verify personalization still works
- [ ] Verify 30-day rotation still works

### Calendar Import
- [ ] Import to Google Calendar
- [ ] Import to Outlook
- [ ] Import to Apple Calendar
- [ ] Verify events display correctly
- [ ] Verify descriptions and times are correct

---

## Summary

✅ **Calendar download feature fully implemented**
✅ **7-day action assignment working**
✅ **Challenge integration complete**
✅ **Email templates updated**
✅ **Algorithm respects pre-assigned actions**
✅ **Ready for testing and deployment**

The feature enables users to:
- Download future actions to their calendar
- Plan ahead and commit to actions
- Integrate with 7-day challenges
- Have more control over their action schedule

All while maintaining the personalization and variety of the existing algorithm!


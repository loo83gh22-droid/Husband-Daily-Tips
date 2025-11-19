# Outstanding Tasks & Next Steps

## 🔴 Critical (Must Do)

### 1. Run Recurring Tips Migration ⚠️
**Status**: Code ready, migration needs to be run

**SQL to Run in Supabase**:
```sql
-- Add recurring tip fields to tips table
ALTER TABLE tips ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly'));
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_day INTEGER;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_time TIME;

-- Track recurring tip completions
CREATE TABLE IF NOT EXISTS recurring_tip_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tip_id, scheduled_date)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_user_id ON recurring_tip_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_tip_id ON recurring_tip_completions(tip_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_scheduled_date ON recurring_tip_completions(scheduled_date);

-- Update the Weekly Relationship Check-In tip to be recurring (Sundays)
UPDATE tips 
SET is_recurring = TRUE, 
    recurrence_type = 'weekly', 
    recurrence_day = 0 
WHERE title = 'Weekly Relationship Check-In';

-- User calendar preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS calendar_preferences JSONB DEFAULT '{}'::jsonb;
```

**What This Enables**:
- Weekly check-ins appear automatically on scheduled day
- Recurring tip tracking
- Calendar preferences storage

---

## 🟡 Important (Should Do Soon)

### 2. Email Service Setup (Optional but Recommended)
**Status**: Code ready, needs Resend account

**Steps**:
1. Follow `EMAIL_SETUP_GUIDE.md`
2. Create Resend account at resend.com
3. Get API key
4. Install: `npm install resend`
5. Add `RESEND_API_KEY` to environment variables
6. Add `CRON_SECRET` (generate with `openssl rand -hex 32`)
7. Uncomment code in `lib/email.ts`
8. Configure cron in Vercel dashboard

**What This Enables**: Daily email at 12pm with tomorrow's tip preview

---

### 3. Comments UI for Deep Thoughts ✅
**Status**: COMPLETE - Working and tested!

**What Was Built**:
- ✅ Comment form component (`DeepThoughtsCommentForm.tsx`)
- ✅ Post component with integrated comments (`DeepThoughtsPost.tsx`)
- ✅ API route for creating comments (`/api/deep-thoughts/comments`)
- ✅ Real-time comment display
- ✅ Comment count display

**Features**:
- Users can comment on shared reflections
- Comments appear immediately after posting
- Supportive community engagement

---

## 🟢 Nice to Have (Enhancements)

### 4. Story Submissions
**Status**: Stories page exists, needs database integration

**What's Needed**:
- Create `stories` table
- Story submission form
- Admin approval workflow
- User story display

**SQL Migration Needed**:
```sql
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  approved BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 5. Badge Progress Indicators
**Status**: Badges display, but no progress shown

**Enhancement**: Show "3/5 completed" for badges that require multiple actions

**Example**: "Communication Champion - 7/10 completed"

---

### 6. Health Milestone Celebrations
**Status**: Health bar exists, no celebrations

**Enhancement**: Popup/notification when reaching 50, 75, 100 health

---

### 7. Tip Favorites
**Status**: Database column exists (`favorited`), no UI

**Enhancement**: Add "Favorite" button to tip cards, show favorites page

---

### 8. Journal Export
**Status**: Journal displays, no export

**Enhancement**: Export journal as PDF or text file

---

## 🔵 Future Features (Long-term)

### 9. Payment Integration (Stripe)
**Status**: UI ready, payments not connected

**What's Needed**:
- Stripe account setup
- Install Stripe SDK
- Create checkout API routes
- Webhook handlers
- Subscription management

---

### 10. Enhanced Badge System
**Status**: Basic badges work, can be enhanced

**Enhancements**:
- Category-specific badge tracking
- Time-based badges (complete before 9am)
- Action-specific badges (plan 3 surprise dates)
- Badge themes in database

---

### 11. Analytics Dashboard
**Status**: Stats exist, no analytics

**What's Needed**:
- User engagement tracking
- Popular tips analytics
- Badge completion rates
- Health score trends

---

### 12. Admin Panel
**Status**: No admin features

**What's Needed**:
- User management
- Content management (add/edit tips)
- Story approval
- Analytics overview

---

## 📋 Quick Summary

### Must Do Now:
1. ✅ Run recurring tips migration (003) - DONE

### Should Do Soon:
2. ⚠️ Set up email service (optional)
3. ✅ Build comments UI for Deep Thoughts - DONE

### Nice to Have:
4. Story submissions
5. Badge progress indicators
6. Health milestones
7. Tip favorites UI
8. Journal export

### Future:
9. Payment integration
10. Enhanced badges
11. Analytics
12. Admin panel

---

## 🎯 Recommended Priority Order

1. **Run recurring tips migration** (5 minutes) - Unlocks weekly check-ins
2. **Build comments UI** (1-2 hours) - Completes Deep Thoughts forum
3. **Set up email service** (15-20 minutes) - Daily tip previews
4. **Add badge progress indicators** (1 hour) - Better UX
5. **Story submissions** (2-3 hours) - User-generated content

---

**Current Status**: Core features working, recurring tips migration needed, optional enhancements available.


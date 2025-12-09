# Site Testing Checklist

## ✅ Birthday Action Logic Tests (Automated)
- [x] Birthday calculation is correct (104 days away)
- [x] Birthday actions are NOT served when >21 days away
- [x] Email template correctly identifies birthday vs non-birthday actions
- [x] All safeguards are in place

## 🧪 Manual Testing Checklist

### 1. Email Functionality
- [ ] **Email Delivery Test**
  - [ ] Check that daily emails are being sent at 6am in user's timezone
  - [ ] Verify email content matches dashboard action
  - [ ] Check that email formatting is correct

- [ ] **Birthday Email Test** (for future when birthday is within 21 days)
  - [ ] Verify birthday header only shows when ALL 5 actions contain "birthday"
  - [ ] Verify birthday actions are only served 0-21 days before birthday
  - [ ] Test with a user whose birthday is within 21 days

- [ ] **Planning Actions Email Test**
  - [ ] Verify planning actions show on first work day
  - [ ] Verify planning actions summary shows on other work days
  - [ ] Check that actions are correctly categorized

### 2. Dashboard Functionality
- [ ] **Daily Action Display**
  - [ ] Verify today's action matches email
  - [ ] Check action completion works
  - [ ] Verify action replacement works

- [ ] **Planning Actions Display**
  - [ ] Check planning actions show on first work day
  - [ ] Verify all 5 planning actions are displayed
  - [ ] Check that actions link correctly

- [ ] **Category Colors**
  - [ ] Verify category colors are applied correctly
  - [ ] Check that badges match category colors
  - [ ] Verify "See More" buttons match category colors

### 3. User Profile Tests
- [ ] **Birthday Settings**
  - [ ] Verify birthday is stored correctly in database
  - [ ] Test updating birthday in profile
  - [ ] Check that birthday changes are reflected in action selection

- [ ] **Work Days Settings**
  - [ ] Verify work days affect email scheduling
  - [ ] Test different work day configurations
  - [ ] Check that first work day logic works correctly

### 4. Action Selection Tests
- [ ] **Regular Actions**
  - [ ] Verify daily actions are selected correctly
  - [ ] Check that actions aren't repeated too frequently
  - [ ] Verify category balancing works

- [ ] **Planning Actions**
  - [ ] Verify planning actions are selected on first work day
  - [ ] Check that planning actions aren't repeated within 30 days
  - [ ] Verify country-specific actions work correctly

- [ ] **Holiday Actions**
  - [ ] Test holiday actions are served during holiday weeks
  - [ ] Verify holiday header shows correctly
  - [ ] Check country-specific holidays (US vs CA)

### 5. Subscription & Access Tests
- [ ] **Free Tier**
  - [ ] Verify free users get 1 action per week
  - [ ] Check that premium actions are not accessible
  - [ ] Verify upgrade prompts work

- [ ] **Premium Tier**
  - [ ] Verify premium users get daily actions
  - [ ] Check that all actions are accessible
  - [ ] Verify 7-day email delivery works

### 6. UI/UX Tests
- [ ] **Responsive Design**
  - [ ] Test on mobile devices
  - [ ] Test on tablet
  - [ ] Test on desktop
  - [ ] Verify landing page looks good on all devices

- [ ] **Navigation**
  - [ ] Test all navigation links
  - [ ] Verify dashboard navigation works
  - [ ] Check that back buttons work correctly

- [ ] **Performance**
  - [ ] Check page load times
  - [ ] Verify images load correctly
  - [ ] Test with slow network connection

### 7. Edge Cases
- [ ] **Timezone Edge Cases**
  - [ ] Test users in different timezones
  - [ ] Verify email delivery time is correct
  - [ ] Check daylight saving time transitions

- [ ] **Date Edge Cases**
  - [ ] Test users with birthdays on different days of week
  - [ ] Verify year-end birthday calculations
  - [ ] Check leap year handling

- [ ] **Data Edge Cases**
  - [ ] Test users with no birthday set
  - [ ] Test users with no work days set
  - [ ] Verify graceful handling of missing data

## 🐛 Known Issues to Monitor

1. **Birthday Actions**: Should NOT be served when birthday is >21 days away
2. **Email Template**: Birthday header should only show when ALL actions contain "birthday"
3. **Weekly Review**: Sunday emails should show correct week range based on user's first work day

## 📝 Test Results Log

| Date | Test | Result | Notes |
|------|------|--------|-------|
| 2025-12-08 | Birthday Logic (Automated) | ✅ Pass | All 4 tests passed |
| | | | |

## 🚀 Quick Test Commands

```bash
# Test birthday logic
node scripts/test-birthday-logic.js

# Check user data
node scripts/check-user-birthday.js

# Check recent actions
node scripts/check-user-email-actions.js
```


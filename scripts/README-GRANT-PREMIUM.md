# How to Grant Premium Access

## Quick Method (Recommended)

**From your project directory, run:**

```bash
npm run grant:premium user@example.com
```

Replace `user@example.com` with the actual user's email address.

**That's it!** The user will immediately have premium access.

---

## Alternative: SQL Script

If you prefer using Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Open `scripts/grant-premium-access.sql`
3. Replace `'user@example.com'` with the actual email
4. Run the script

---

## What Happens

- User's `subscription_tier` is set to `'premium'`
- **Lifetime access** (no expiration, no Stripe subscription needed)
- User gets all premium features immediately:
  - Daily personalized actions
  - Weekly planning actions
  - All premium features
  - No trial expiration

---

## Examples

```bash
# Grant premium to a test supporter
npm run grant:premium testuser@example.com

# Grant premium to a friend
npm run grant:premium friend@example.com
```

---

## Notes

- The user must have already signed up (created an account)
- The script will show an error if the email doesn't exist
- If the user already has premium, it will tell you (no changes made)
- This grants **lifetime** premium access (no Stripe subscription)

---

## Troubleshooting

**"User not found"**
- Make sure the user has signed up first
- Check the email address spelling
- User must exist in the `users` table

**Script won't run**
- Make sure you're in the project root directory
- Check that `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` set
- Run `npm install` if you get module errors


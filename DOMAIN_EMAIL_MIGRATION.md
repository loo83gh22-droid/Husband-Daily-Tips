# Domain & Email Migration Guide

## ✅ Good News: Everything is Configurable!

**You can easily change:**
- ✅ Domain name
- ✅ Email addresses
- ✅ App name/branding
- ✅ All without breaking existing data

**Nothing is hardcoded** - everything uses environment variables!

---

## 📋 What Needs to Be Updated

### 1. Environment Variables (Easy - Just Update .env.local)

**Current Setup:**
```env
AUTH0_BASE_URL=http://localhost:3000
RESEND_FROM_EMAIL=Husband Daily Tips <onboarding@resend.dev>
```

**New Setup (After Getting Domain):**
```env
AUTH0_BASE_URL=https://yourdomain.com
RESEND_FROM_EMAIL=Husband Daily Tips <tips@yourdomain.com>
```

**That's it!** Everything else uses these variables.

---

### 2. Auth0 Configuration (5 minutes)

1. **Go to Auth0 Dashboard**
   - [auth0.com](https://auth0.com) → Your Application

2. **Update Allowed Callback URLs**
   - Settings → Application URIs
   - Update:
     - **Allowed Callback URLs**: `https://yourdomain.com/api/auth/callback`
     - **Allowed Logout URLs**: `https://yourdomain.com`
     - **Allowed Web Origins**: `https://yourdomain.com`

3. **Save Changes**

---

### 3. Resend Domain Verification (15-20 minutes)

1. **Get a Domain** (~$10-15/year)
   - Namecheap, Google Domains, Cloudflare, etc.

2. **Verify in Resend**
   - Resend Dashboard → Domains → Add Domain
   - Add DNS records to your domain
   - Wait for verification

3. **Update Email Address**
   - Change `RESEND_FROM_EMAIL` to: `Husband Daily Tips <tips@yourdomain.com>`

---

### 4. Vercel Domain Setup (5 minutes)

1. **Add Custom Domain**
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Add DNS records Vercel provides
   - Wait for verification

2. **Update Environment Variables in Vercel**
   - Settings → Environment Variables
   - Update `AUTH0_BASE_URL` to: `https://yourdomain.com`
   - Update `RESEND_FROM_EMAIL` to: `Husband Daily Tips <tips@yourdomain.com>`

---

### 5. App Name/Branding (Optional)

**Current Name**: "Husband Daily Tips"

**To Change:**
- Search and replace in codebase (if you want a different name)
- Or keep it - it's already professional!

**Files to Update (if changing name):**
- `app/page.tsx` (landing page)
- `components/DashboardNav.tsx` (navigation)
- Email templates in `lib/email.ts`
- Any other branding text

---

## 🔄 Migration Steps (In Order)

### Step 1: Get Your Domain
- Buy domain from Namecheap/Google/Cloudflare
- Cost: ~$10-15/year

### Step 2: Set Up Domain in Vercel
1. Vercel → Project → Settings → Domains
2. Add your domain
3. Add DNS records
4. Wait for verification

### Step 3: Update Auth0
1. Auth0 Dashboard → Your App → Settings
2. Update callback URLs to use your domain
3. Save

### Step 4: Verify Domain in Resend
1. Resend Dashboard → Domains
2. Add your domain
3. Add DNS records
4. Wait for verification

### Step 5: Update Environment Variables

**In `.env.local` (local development):**
```env
AUTH0_BASE_URL=https://yourdomain.com
RESEND_FROM_EMAIL=Husband Daily Tips <tips@yourdomain.com>
```

**In Vercel (production):**
- Settings → Environment Variables
- Update the same variables
- Redeploy

### Step 6: Test Everything
1. Test login/logout
2. Test email sending
3. Verify everything works

---

## ✅ What WON'T Break

- ✅ **User accounts** - All existing users stay the same
- ✅ **Database data** - Nothing changes
- ✅ **Tips, badges, challenges** - All preserved
- ✅ **User progress** - Streaks, health, completions all stay

**Only thing that changes:** The URLs and email addresses (configuration only)

---

## 🎯 Recommended Domain Names

**Ideas:**
- `husbanddailytips.com`
- `dailymarriageaction.com`
- `husbandaction.com`
- `marriagelevelup.com`
- `husbandgame.com`

**Check availability:**
- [Namecheap](https://www.namecheap.com)
- [Google Domains](https://domains.google)
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar)

---

## 📝 Quick Checklist

**Before Migration:**
- [ ] Domain purchased
- [ ] Domain added to Vercel
- [ ] Domain verified in Resend
- [ ] Auth0 callback URLs updated

**During Migration:**
- [ ] Update `.env.local` with new domain
- [ ] Update Vercel environment variables
- [ ] Redeploy to Vercel
- [ ] Test login/logout
- [ ] Test email sending

**After Migration:**
- [ ] Everything works on new domain
- [ ] Emails sending from new address
- [ ] Old domain redirects (optional)

---

## 💡 Pro Tips

1. **Keep old domain working** (optional):
   - Set up redirect from old to new domain
   - Or keep both domains active

2. **Test in staging first**:
   - Use a subdomain like `staging.yourdomain.com`
   - Test everything before switching production

3. **Update social media/links**:
   - Update any links you've shared
   - Update social media profiles

---

## 🚀 When to Do This

**Best Time:**
- ✅ **Now** - Before you have many users
- ✅ **Before launch** - Clean setup from the start
- ✅ **During testing** - Easy to test changes

**Not Critical:**
- You can keep using `onboarding@resend.dev` for now
- Change when you're ready for production
- Everything will work the same way

---

## 📞 Need Help?

The migration is straightforward:
1. Get domain
2. Update environment variables
3. Verify in services
4. Done!

**Estimated Time:** 30-45 minutes total

---

**Bottom Line:** Everything is configurable via environment variables. Changing domain/email is just updating a few config values - no code changes needed!


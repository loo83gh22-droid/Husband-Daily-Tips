# Domain & Email Setup - Step by Step Checklist

## 🎯 Goal
Set up a professional domain and email address for your app, replacing the personal/testing setup.

---

## ✅ Pre-Flight Checklist

Before starting, make sure you have:
- [ ] Resend account (you already have this ✅)
- [ ] Vercel account (you already have this ✅)
- [ ] Auth0 account (you already have this ✅)
- [ ] Credit card ready (for domain purchase, ~$10-15/year)

---

## 📋 Step-by-Step Process

### STEP 1: Choose & Buy Your Domain (10 minutes)

**What to do:**
1. Go to [namecheap.com](https://www.namecheap.com) (or Google Domains, Cloudflare)
2. Search for domain ideas:
   - `husbanddailytips.com`
   - `dailymarriageaction.com`
   - `husbandaction.com`
   - `marriagelevelup.com`
   - `husbandgame.com`
3. Pick one that's available
4. Add to cart and checkout (~$10-15/year)
5. Complete purchase

**✅ Checkpoint:** Domain purchased and in your account

**Time:** 10 minutes

---

### STEP 2: Add Domain to Vercel (5 minutes)

**What to do:**
1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter your domain (e.g., `yourdomain.com`)
5. Click **"Add"**
6. Vercel will show you DNS records to add

**DNS Records to Add:**
- Vercel will show you something like:
  - Type: `A` → Value: `76.76.21.21`
  - Type: `CNAME` → Value: `cname.vercel-dns.com`

**Where to Add DNS Records:**
1. Go to your domain registrar (Namecheap, etc.)
2. Find **DNS Management** or **Advanced DNS**
3. Add the records Vercel provided
4. Save

**Wait:** 5-30 minutes for DNS to propagate

**✅ Checkpoint:** Domain shows as "Valid" in Vercel dashboard

**Time:** 5 minutes (plus wait time)

---

### STEP 3: Verify Domain in Resend (15-20 minutes)

**What to do:**
1. Go to [resend.com](https://resend.com) → Dashboard
2. Click **"Domains"** in left sidebar
3. Click **"Add Domain"**
4. Enter your domain (e.g., `yourdomain.com`)
5. Click **"Add"**
6. Resend will show you DNS records to add

**DNS Records to Add:**
Resend will show you 2-3 TXT records like:
- **SPF Record** (TXT)
- **DKIM Record** (TXT)
- **DMARC Record** (TXT) - optional but recommended

**Where to Add DNS Records:**
1. Go back to your domain registrar
2. Find **DNS Management** or **Advanced DNS**
3. Add the TXT records Resend provided
4. Save

**Wait:** 5-30 minutes for verification

**Check Status:**
- Go back to Resend → Domains
- You'll see a green checkmark when verified ✅

**✅ Checkpoint:** Domain shows as "Verified" in Resend

**Time:** 15-20 minutes (plus wait time)

---

### STEP 4: Update Auth0 Callback URLs (3 minutes)

**What to do:**
1. Go to [auth0.com](https://auth0.com) → Dashboard
2. Click **Applications** → Your Application
3. Click **Settings** tab
4. Scroll to **Application URIs**

**Update These Fields:**
- **Allowed Callback URLs:**
  ```
  http://localhost:3000/api/auth/callback, https://yourdomain.com/api/auth/callback
  ```
  (Keep localhost for development, add your new domain)

- **Allowed Logout URLs:**
  ```
  http://localhost:3000, https://yourdomain.com
  ```

- **Allowed Web Origins:**
  ```
  http://localhost:3000, https://yourdomain.com
  ```

5. Click **"Save Changes"**

**✅ Checkpoint:** Auth0 settings saved with new domain

**Time:** 3 minutes

---

### STEP 5: Update Local Environment Variables (2 minutes)

**What to do:**
1. Open your `.env.local` file
2. Update these lines:

**Change:**
```env
AUTH0_BASE_URL=http://localhost:3000
RESEND_FROM_EMAIL=Husband Daily Tips <onboarding@resend.dev>
```

**To:**
```env
AUTH0_BASE_URL=https://yourdomain.com
RESEND_FROM_EMAIL=Husband Daily Tips <tips@yourdomain.com>
```

**Replace `yourdomain.com` with your actual domain!**

3. Save the file

**✅ Checkpoint:** `.env.local` updated with new domain

**Time:** 2 minutes

---

### STEP 6: Update Vercel Environment Variables (3 minutes)

**What to do:**
1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **Settings** → **Environment Variables**
3. Find `AUTH0_BASE_URL` → Click **Edit**
   - Change to: `https://yourdomain.com`
   - Make sure it's set for **Production, Preview, Development**
   - Save
4. Find `RESEND_FROM_EMAIL` → Click **Edit**
   - Change to: `Husband Daily Tips <tips@yourdomain.com>`
   - Make sure it's set for **Production, Preview, Development**
   - Save
5. **Redeploy** (Vercel will prompt you, or go to Deployments → Redeploy)

**✅ Checkpoint:** Vercel environment variables updated and redeployed

**Time:** 3 minutes

---

### STEP 7: Test Everything (5 minutes)

**Test 1: Website on New Domain**
1. Go to `https://yourdomain.com`
2. Should load your app ✅

**Test 2: Login/Logout**
1. Click "Sign In"
2. Should redirect to Auth0 and back ✅
3. Try logging out ✅

**Test 3: Email Sending**
1. Run your test email command again
2. Check your email inbox
3. Should come from `tips@yourdomain.com` ✅

**✅ Checkpoint:** Everything works on new domain

**Time:** 5 minutes

---

## 📝 Quick Reference Checklist

Print this out and check off as you go:

### Phase 1: Domain Purchase
- [ ] **Step 1:** Choose and buy domain (~$10-15/year)
  - Domain: `___________________________`
  - Registrar: `___________________________`

### Phase 2: Domain Setup
- [ ] **Step 2:** Add domain to Vercel
  - Domain added: `___________________________`
  - DNS records added to registrar
  - Status: Valid in Vercel ✅

- [ ] **Step 3:** Verify domain in Resend
  - Domain added to Resend
  - DNS records added to registrar
  - Status: Verified in Resend ✅

### Phase 3: Configuration Updates
- [ ] **Step 4:** Update Auth0 callback URLs
  - Callback URL: `https://yourdomain.com/api/auth/callback`
  - Logout URL: `https://yourdomain.com`
  - Web Origins: `https://yourdomain.com`

- [ ] **Step 5:** Update `.env.local`
  - `AUTH0_BASE_URL=https://yourdomain.com`
  - `RESEND_FROM_EMAIL=Husband Daily Tips <tips@yourdomain.com>`

- [ ] **Step 6:** Update Vercel environment variables
  - `AUTH0_BASE_URL` updated
  - `RESEND_FROM_EMAIL` updated
  - Redeployed ✅

### Phase 4: Testing
- [ ] **Step 7:** Test website loads on new domain
- [ ] **Step 7:** Test login/logout works
- [ ] **Step 7:** Test email sending works
- [ ] **Step 7:** Email comes from new address

---

## ⏱️ Total Time Estimate

- **Domain Purchase:** 10 minutes
- **Vercel Setup:** 5 minutes (+ 5-30 min wait)
- **Resend Verification:** 15-20 minutes (+ 5-30 min wait)
- **Auth0 Update:** 3 minutes
- **Environment Variables:** 5 minutes
- **Testing:** 5 minutes

**Total Active Time:** ~40-50 minutes  
**Total with Wait Times:** ~1-2 hours (most is waiting for DNS)

---

## 🎯 What You'll Have After This

✅ Professional domain (e.g., `yourdomain.com`)  
✅ Professional email (e.g., `tips@yourdomain.com`)  
✅ Website live on your domain  
✅ Emails sending from your domain  
✅ All users can receive emails (not just your personal email)  
✅ Clean, professional setup  

---

## 🐛 Troubleshooting

### Domain Not Verifying in Vercel
- Wait longer (DNS can take up to 48 hours, usually 5-30 min)
- Double-check DNS records are correct
- Make sure you saved changes in your registrar

### Domain Not Verifying in Resend
- Wait longer (5-30 minutes)
- Double-check TXT records are correct
- Make sure records are saved in your registrar

### Auth0 Login Not Working
- Make sure callback URLs are exactly right (no trailing slashes)
- Check that domain is verified in Vercel first
- Try clearing browser cache

### Emails Still Not Sending
- Make sure domain is verified in Resend
- Check `RESEND_FROM_EMAIL` uses your domain (not `onboarding@resend.dev`)
- Check Resend dashboard for error messages

---

## 📞 Need Help?

If you get stuck at any step:
1. Check the error message
2. Verify DNS records are correct
3. Wait a bit longer (DNS propagation takes time)
4. Check the service dashboards (Vercel, Resend, Auth0) for status

---

## 🚀 Ready to Start?

**Begin with Step 1:** Choose and buy your domain!

Once you have your domain, come back and we'll do Steps 2-7 together.

**Recommended Domain Registrars:**
- [Namecheap](https://www.namecheap.com) - Easy to use, good prices
- [Google Domains](https://domains.google) - Simple interface
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar) - Best prices, but need Cloudflare account

**Go get your domain, then we'll continue!** 🎯


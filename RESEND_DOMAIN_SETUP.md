# Step 3: Verify Domain in Resend

## 🎯 Goal
Verify `besthusbandever.com` in Resend so you can send emails from `tips@besthusbandever.com`

---

## Step-by-Step Instructions

### Step 1: Go to Resend Dashboard
1. Go to [resend.com](https://resend.com)
2. Log in
3. Click **"Domains"** in the left sidebar

### Step 2: Add Your Domain
1. Click **"Add Domain"** button
2. Enter: `besthusbandever.com`
3. Click **"Add Domain"**

### Step 3: Copy DNS Records
Resend will show you **2-3 TXT records** to add:
- **SPF Record** (TXT)
- **DKIM Record** (TXT) 
- **DMARC Record** (TXT) - optional but recommended

**You'll see something like:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [long string of characters]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

**Copy these exact values!**

### Step 4: Add DNS Records to Namecheap
1. Go back to Namecheap → Domain List → `besthusbandever.com` → Manage
2. Click **Advanced DNS** tab
3. Click **"Add New Record"** button

**For each TXT record Resend shows:**

**SPF Record:**
- Type: `TXT Record`
- Host: `@` (or leave blank)
- Value: `v=spf1 include:resend.com ~all` (use exact value from Resend)
- TTL: `Automatic`
- Click **Save** (green checkmark)

**DKIM Record:**
- Type: `TXT Record`
- Host: `resend._domainkey` (use exact name from Resend)
- Value: `[long string]` (use exact value from Resend)
- TTL: `Automatic`
- Click **Save** (green checkmark)

**DMARC Record (if shown):**
- Type: `TXT Record`
- Host: `_dmarc`
- Value: `v=DMARC1; p=none;` (use exact value from Resend)
- TTL: `Automatic`
- Click **Save** (green checkmark)

### Step 5: Wait for Verification
1. Go back to Resend → Domains
2. You'll see status: **"Pending"** or **"Verifying"**
3. Wait **5-30 minutes** for DNS propagation
4. Refresh the page
5. When verified, you'll see a **green checkmark** ✅

---

## ⚠️ Important Notes

- **DNS propagation takes time** (5-30 minutes, sometimes up to 48 hours)
- **Don't worry if it's not instant** - this is normal
- **Make sure you copy the exact values** from Resend (no typos!)
- **The DKIM record has a specific host name** (like `resend._domainkey`) - make sure it matches exactly

---

## ✅ When You're Done

Come back and tell me:
- "Domain added to Resend"
- "DNS records added to Namecheap"
- "Status shows Verified in Resend" (or "Still pending, but records are added")

Then we'll move to Step 4 (Update Auth0)!

---

## 🐛 Troubleshooting

**If Resend shows an error:**
- Double-check DNS records are exactly right
- Make sure you saved them in Namecheap
- Wait a bit longer (DNS is slow sometimes)
- Check for typos in the TXT record values

**If it's been more than 30 minutes:**
- Check Namecheap DNS records are saved correctly
- Make sure there are no typos
- Try refreshing Resend page

---

**Go do Step 3 now, then come back!** 🚀

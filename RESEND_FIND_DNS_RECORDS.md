# How to Find DNS Records in Resend

## 🔍 Where to Find the DNS Records

### Step 1: Go to Resend Domains
1. Go to [resend.com](https://resend.com)
2. Log in
3. Click **"Domains"** in the left sidebar

### Step 2: Click on Your Domain
1. You should see `besthusbandever.com` in the list
2. **Click on the domain name** (not just the checkbox)
3. This opens the domain details page

### Step 3: Find DNS Records Section
On the domain details page, you should see:
- **"DNS Configuration"** section
- Or **"DNS Records"** section
- Or **"Verification"** section

This is where the TXT records are shown!

---

## 📋 What You Should See

Resend will show you something like:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Value: [long string of characters and numbers]
```

**DMARC Record (optional):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

---

## 🐛 If You Don't See DNS Records

**Possible reasons:**
1. **Domain not fully added yet** - Try refreshing the page
2. **Looking at wrong section** - Make sure you clicked on the domain name itself
3. **Resend still processing** - Wait a minute and refresh

**What to do:**
1. Make sure you're on the domain details page (clicked on `besthusbandever.com`)
2. Look for sections like:
   - "DNS Configuration"
   - "DNS Records"
   - "Verification"
   - "Add these records"
3. Scroll down - sometimes they're lower on the page
4. Try refreshing the page

---

## 📸 What the Page Should Look Like

The domain details page should have:
- Domain name at the top: `besthusbandever.com`
- Status: "Pending" or "Verifying"
- A section showing DNS records to add
- Copy buttons next to each record value

---

## ✅ Next Steps

Once you find the DNS records:
1. Copy each TXT record (SPF, DKIM, DMARC)
2. Add them to Namecheap (Advanced DNS)
3. Wait for verification

---

**Can you see the domain details page when you click on `besthusbandever.com`?**


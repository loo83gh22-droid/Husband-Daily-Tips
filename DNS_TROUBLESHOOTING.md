# DNS Verification Troubleshooting Guide 🔍

If your DNS records have been in "Pending" status for a long time, here are the most common causes and how to fix them.

## 🔍 Common Issues

### 1. **DNS Records Not Actually Visible** (Most Common)

**Problem**: Records are added in Namecheap but not actually propagating.

**Check**:
1. Go to [mxtoolbox.com](https://mxtoolbox.com)
2. Select **TXT Lookup** or **MX Lookup**
3. Enter your domain (e.g., `yourdomain.com`)
4. Check if the records appear

**For Resend records, check specifically:**
- `resend._domainkey.yourdomain.com` (TXT record)
- `send.yourdomain.com` (TXT record for SPF)
- `send.yourdomain.com` (MX record)

**If records don't show**:
- DNS hasn't propagated yet (can take 24-48 hours)
- Records were added incorrectly
- Wrong nameservers

---

### 2. **Records Added with Wrong Host/Subdomain**

**Problem**: Records added as `@` instead of specific subdomain, or vice versa.

**Check in Namecheap**:
- For `resend._domainkey` → Host should be: `resend._domainkey` (NOT `@`)
- For `send` TXT → Host should be: `send` (NOT `@`)
- For `send` MX → Host should be: `send` (NOT `@`)

**In Namecheap DNS settings:**
- **Host**: `resend._domainkey` (full subdomain)
- **Value**: The full TXT value from Resend
- **TTL**: `Automatic` or `300`

---

### 3. **TXT Record Value Format Issues**

**Problem**: TXT record value might have extra spaces, quotes, or formatting issues.

**Check**:
1. Copy the **exact** value from Resend dashboard
2. Paste it into Namecheap exactly as shown
3. **Do NOT** add quotes around the value (unless Resend shows them)
4. **Do NOT** add extra spaces at the beginning or end

**Example of correct format:**
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

**Example of WRONG format:**
```
"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```
(No quotes unless Resend specifically shows them)

---

### 4. **Using Wrong Nameservers**

**Problem**: Domain is using default Namecheap nameservers but DNS is managed elsewhere.

**Check**:
1. Go to Namecheap → **Domain List** → Your domain → **Manage**
2. Check **Nameservers** section
3. If you're using:
   - **Namecheap BasicDNS** → Records should work
   - **Custom DNS** → Records should be added where your DNS is hosted
   - **Vercel DNS** → Records need to be added in Vercel, not Namecheap

**If using Vercel DNS**:
- Go to Vercel → Your Project → **Settings** → **Domains** → **DNS Records**
- Add records there instead of Namecheap

---

### 5. **Multiple DNS Providers Conflict**

**Problem**: Domain pointing to different DNS providers causing conflicts.

**Solution**:
- Use **one** DNS provider only
- If using Vercel DNS, remove Namecheap DNS records
- If using Namecheap DNS, make sure nameservers point to Namecheap

---

### 6. **MX Record Priority Issues**

**Problem**: MX record priority might be wrong.

**Check in Namecheap**:
- **Type**: MX
- **Host**: `send` (or `@` if Resend says so)
- **Value**: The mail server from Resend (e.g., `feedback-smtp.us-east-...`)
- **Priority**: `10` (or whatever Resend shows)
- **TTL**: `Automatic`

---

### 7. **DMARC Record Format**

**Problem**: DMARC record might be incorrectly formatted.

**Check**:
- **Type**: TXT
- **Host**: `_dmarc` (with underscore)
- **Value**: `v=DMARC1; p=none;` (exact format)
- **TTL**: `Automatic`

---

## 🛠️ Step-by-Step Verification

### Step 1: Verify Records in Namecheap

1. Log into Namecheap
2. Go to **Domain List** → Your domain → **Advanced DNS**
3. Verify each record exists and matches exactly:

**For DKIM:**
- ✅ Type: `TXT`
- ✅ Host: `resend._domainkey`
- ✅ Value: Starts with `p=MIGf...` (full value from Resend)
- ✅ TTL: `Automatic`

**For SPF:**
- ✅ Type: `TXT`
- ✅ Host: `send`
- ✅ Value: `v=spf1 include:amazonses.com ~all` (or Resend's exact value)
- ✅ TTL: `Automatic`

**For MX:**
- ✅ Type: `MX`
- ✅ Host: `send`
- ✅ Value: The mail server from Resend
- ✅ Priority: `10` (or Resend's value)
- ✅ TTL: `Automatic`

### Step 2: Verify DNS Propagation

Use online DNS checkers to verify records are actually visible:

1. **MXToolbox** - [mxtoolbox.com](https://mxtoolbox.com)
   - Select **TXT Lookup**
   - Enter: `resend._domainkey.yourdomain.com`
   - Click **TXT Lookup**
   - Should show your DKIM value

2. **Google DNS Check** - [toolbox.googleapps.com](https://toolbox.googleapps.com/apps/checkmx)
   - Enter your domain
   - Check MX records

3. **DNS Checker** - [dnschecker.org](https://dnschecker.org)
   - Enter: `send.yourdomain.com`
   - Select **TXT Record**
   - Check if SPF record appears globally

### Step 3: Compare with Resend Dashboard

1. Go to Resend → **Domains** → Your domain
2. Copy the **exact** values shown
3. Compare with what's in Namecheap
4. Make sure they match **character for character**

### Step 4: Wait for DNS Propagation

Even if everything is correct:
- DNS changes can take **15 minutes to 48 hours** to propagate globally
- Different DNS servers update at different rates
- Check multiple DNS servers (Google 8.8.8.8, Cloudflare 1.1.1.1, etc.)

---

## 🔧 Quick Fixes

### Fix 1: Delete and Re-add Records

Sometimes deleting and re-adding records helps:

1. In Namecheap, delete the pending record
2. Wait 5 minutes
3. Add the record again with exact values from Resend
4. Wait for propagation

### Fix 2: Lower TTL Temporarily

1. Change TTL to `300` (5 minutes) in Namecheap
2. Wait for changes to propagate
3. Change back to `Automatic` later

### Fix 3: Check for Duplicate Records

Make sure you don't have:
- Multiple TXT records for `send` (only one SPF record allowed)
- Multiple MX records for `send` (unless Resend requires multiple)

### Fix 4: Verify Nameservers

1. Check current nameservers in Namecheap
2. Make sure they point to where DNS is managed
3. If using Namecheap DNS, should show Namecheap nameservers
4. If using Vercel DNS, should show Vercel nameservers

---

## 📞 Contact Resend Support

If records are correct and still pending after 24-48 hours:

1. **Screenshot**:
   - Your Namecheap DNS records
   - Resend dashboard showing pending status
   - DNS lookup results from mxtoolbox.com

2. **Contact Resend**:
   - Email: support@resend.com
   - Include screenshots
   - Mention how long records have been pending

3. **Resend Support can**:
   - Check their end for verification issues
   - Manually trigger verification
   - Help troubleshoot DNS problems

---

## ✅ Quick Checklist

- [ ] Records added in correct DNS provider (Namecheap vs Vercel)
- [ ] Host/subdomain matches exactly (e.g., `send`, not `@`)
- [ ] TXT values copied exactly from Resend (no extra quotes/spaces)
- [ ] MX priority matches Resend's value
- [ ] No duplicate records
- [ ] Nameservers point to correct provider
- [ ] Waited at least 15-30 minutes for propagation
- [ ] Verified with DNS lookup tools (mxtoolbox.com)
- [ ] Compared values character-by-character with Resend

---

## 🎯 Most Likely Fix

If stuck for a long time, most common issues are:

1. **Host name wrong** (e.g., using `@` instead of `send`)
2. **TXT value has extra quotes or spaces**
3. **Using wrong DNS provider** (records in Namecheap but DNS managed by Vercel)
4. **DNS not actually propagated** (check with mxtoolbox.com)

**Start with**: Verify the records are actually visible using DNS lookup tools, then compare values character-by-character with Resend.


# SPF and DMARC Fix Guide 🔧

## 🔴 Common SPF Issues

### Issue 1: Multiple SPF Records (Most Common!)

**Problem**: You can only have **ONE** SPF record per domain/subdomain. If you have multiple SPF records, email servers will reject them.

**Check in Namecheap:**
1. Go to **Advanced DNS** tab
2. Look for **ALL** TXT records with host `send` or `@`
3. Check if any have `v=spf1` in the value
4. You should have **ONLY ONE** SPF record

**Fix:**
- Delete any old/duplicate SPF records
- Keep only the one from Resend: `v=spf1 include:amazonses.com ~all`
- Or merge multiple SPF records into one (if needed)

**Example of merging (if you have multiple):**
```
Wrong (2 separate records):
Record 1: v=spf1 include:amazonses.com ~all
Record 2: v=spf1 include:_spf.google.com ~all

Correct (1 merged record):
v=spf1 include:amazonses.com include:_spf.google.com ~all
```

---

### Issue 2: Wrong Host Name for SPF

**Problem**: SPF record added with wrong host name.

**Check:**
- ❌ Wrong: Host = `@` (for root domain SPF)
- ✅ Correct: Host = `send` (for Resend subdomain)

**If using Resend:**
- SPF should be at `send.besthusbandever.com`
- Host in Namecheap: `send`
- Type: `TXT`
- Value: `v=spf1 include:amazonses.com ~all` (or Resend's exact value)

---

### Issue 3: SPF Record Value Format

**Common mistakes:**
- ❌ Extra quotes: `"v=spf1 include:amazonses.com ~all"`
- ❌ Missing `~all` or `-all` at the end
- ❌ Wrong include domain
- ❌ Extra spaces

**Correct format:**
```
v=spf1 include:amazonses.com ~all
```

**Check Resend dashboard** for the exact value and copy it character-by-character.

---

### Issue 4: SPF Record Not Propagating

**Verify SPF record exists:**
1. Go to [mxtoolbox.com](https://mxtoolbox.com)
2. Select **TXT Lookup**
3. Enter: `send.besthusbandever.com`
4. Click **TXT Lookup**
5. Should show your SPF value

**If not found:**
- Record wasn't added correctly
- Wrong host name
- DNS not propagated (wait 15-30 minutes)

---

## 🔴 Common DMARC Issues

### Issue 1: Wrong Host Name for DMARC

**Problem**: DMARC record needs underscore prefix.

**Check in Namecheap:**
- ❌ Wrong: Host = `dmarc` or `@`
- ✅ Correct: Host = `_dmarc` (with underscore!)

**DMARC Record:**
- Type: `TXT`
- Host: `_dmarc` (must have underscore)
- Value: `v=DMARC1; p=none;` (or your policy)
- TTL: `Automatic`

---

### Issue 2: DMARC Policy Format

**Common formats:**

**Basic (for testing):**
```
v=DMARC1; p=none;
```

**Recommended (for production):**
```
v=DMARC1; p=quarantine; pct=100;
```

**Strict (for high security):**
```
v=DMARC1; p=reject; pct=100;
```

**Important:**
- Must start with `v=DMARC1;`
- Policy `p=` can be: `none`, `quarantine`, or `reject`
- Use semicolons (`;`) to separate parameters
- No extra spaces around semicolons

---

### Issue 3: Multiple DMARC Records

**Problem**: Can only have **ONE** DMARC record.

**Check:**
- Look for all TXT records with host `_dmarc`
- Should have only one
- Delete duplicates

---

### Issue 4: DMARC Record Location

**DMARC should be at:**
- `_dmarc.besthusbandever.com` (root domain)
- Not at a subdomain

**In Namecheap:**
- Host: `_dmarc` (for root domain)
- Not: `_dmarc.send` or anything else

---

## 🔍 Step-by-Step Verification

### Step 1: Check Current SPF Record

1. **In Namecheap:**
   - Go to Advanced DNS
   - Find all TXT records for host `send`
   - Count how many have `v=spf1`
   - Should be **ONLY ONE**

2. **Verify with MXToolbox:**
   - Go to [mxtoolbox.com](https://mxtoolbox.com)
   - TXT Lookup → `send.besthusbandever.com`
   - Should show your SPF value

### Step 2: Check Current DMARC Record

1. **In Namecheap:**
   - Find TXT record for host `_dmarc`
   - Should be only one
   - Verify value format is correct

2. **Verify with MXToolbox:**
   - TXT Lookup → `_dmarc.besthusbandever.com`
   - Should show your DMARC value

### Step 3: Compare with Resend Dashboard

1. Go to Resend → Domains → `besthusbandever.com`
2. Check what values Resend expects:
   - SPF value
   - DMARC value (if Resend shows one)
3. Compare character-by-character with Namecheap

---

## ✅ Quick Fix Checklist

### For SPF:
- [ ] Only **ONE** SPF record exists (no duplicates)
- [ ] Host is `send` (not `@`)
- [ ] Value is exactly: `v=spf1 include:amazonses.com ~all` (or Resend's value)
- [ ] No quotes around the value
- [ ] Verified with MXToolbox TXT lookup
- [ ] Waited 15-30 minutes for propagation

### For DMARC:
- [ ] Only **ONE** DMARC record exists
- [ ] Host is `_dmarc` (with underscore, not `dmarc`)
- [ ] Value starts with `v=DMARC1;`
- [ ] Proper policy format (e.g., `p=none;` or `p=quarantine;`)
- [ ] No extra quotes or spaces
- [ ] Verified with MXToolbox TXT lookup

---

## 🔧 Specific Fixes

### Fix SPF "Pending" Status

1. **Delete all existing SPF records** for `send`
2. **Add fresh SPF record**:
   - Type: `TXT`
   - Host: `send`
   - Value: Copy exact value from Resend dashboard
   - TTL: `Automatic`
3. **Wait 15-30 minutes**
4. **Verify with MXToolbox**
5. **Check Resend dashboard** for verification

### Fix DMARC "Pending" Status

1. **Delete existing DMARC record** (if incorrect)
2. **Add fresh DMARC record**:
   - Type: `TXT`
   - Host: `_dmarc` (with underscore!)
   - Value: `v=DMARC1; p=none;` (or your preferred policy)
   - TTL: `Automatic`
3. **Wait 15-30 minutes**
4. **Verify with MXToolbox**
5. **Note**: Resend may not require DMARC verification, but it's good to have it set up

---

## 🚨 Common Mistakes Summary

### SPF Mistakes:
- ❌ Multiple SPF records
- ❌ Wrong host (`@` instead of `send`)
- ❌ Value has quotes or wrong format
- ❌ Missing `~all` at the end

### DMARC Mistakes:
- ❌ Missing underscore (`dmarc` instead of `_dmarc`)
- ❌ Wrong value format
- ❌ Multiple DMARC records
- ❌ Wrong location (subdomain instead of root)

---

## 🔍 How to Check What's Actually in DNS

### Check SPF:
```bash
# Use MXToolbox or command line:
nslookup -type=TXT send.besthusbandever.com
```

Should show:
```
send.besthusbandever.com    text = "v=spf1 include:amazonses.com ~all"
```

### Check DMARC:
```bash
nslookup -type=TXT _dmarc.besthusbandever.com
```

Should show:
```
_dmarc.besthusbandever.com    text = "v=DMARC1; p=none;"
```

---

## 📞 Still Not Working?

If SPF/DMARC still pending after:
1. ✅ Verified only one record exists
2. ✅ Verified correct host names
3. ✅ Verified correct values (character-by-character)
4. ✅ Waited 30+ minutes
5. ✅ Verified with MXToolbox

**Contact Resend Support:**
- Email: support@resend.com
- Include:
  - Screenshot of Namecheap DNS records
  - MXToolbox lookup results
  - Resend dashboard showing pending status

---

## 💡 Pro Tip

**DMARC is optional for Resend verification**, but SPF is **required**. Focus on getting SPF verified first.

If SPF is correct but still pending:
- May need to wait longer (up to 24 hours for full propagation)
- Resend's verification system may be checking too quickly
- Try clicking "Verify" or "Refresh" in Resend dashboard after 1 hour


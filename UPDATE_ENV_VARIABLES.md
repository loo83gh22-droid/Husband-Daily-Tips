# Step 5: Update Environment Variables

## 🎯 Goal
Update environment variables to use your new domain `besthusbandever.com`

---

## Part 1: Update Local Environment Variables (`.env.local`)

### Step 1: Open `.env.local`
1. Open your project in your code editor
2. Find `.env.local` file in the root directory
3. Open it

### Step 2: Update `AUTH0_BASE_URL`
Find this line:
```env
AUTH0_BASE_URL=http://localhost:3000
```

**Change it to:**
```env
AUTH0_BASE_URL=https://besthusbandever.com
```

**Note:** For local development, you might want to keep `localhost:3000` and only change it for production. But for now, let's update it to your domain.

### Step 3: Update `RESEND_FROM_EMAIL`
Find this line:
```env
RESEND_FROM_EMAIL=Husband Daily Tips <onboarding@resend.dev>
```

**Change it to:**
```env
RESEND_FROM_EMAIL=Husband Daily Tips <tips@besthusbandever.com>
```

### Step 4: Save the File
- Save `.env.local`
- **Important:** Don't commit this file to Git (it should be in `.gitignore`)

---

## Part 2: Update Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Log in
3. Click on your **Husband Daily Tips** project

### Step 2: Go to Environment Variables
1. Click **"Settings"** (top menu)
2. Click **"Environment Variables"** (left sidebar)

### Step 3: Update `AUTH0_BASE_URL`
1. Find `AUTH0_BASE_URL` in the list
2. Click **"Edit"** (or the three dots → Edit)
3. **Value:** Change to `https://besthusbandever.com`
4. **Environment:** Make sure it's set for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Step 4: Update `RESEND_FROM_EMAIL`
1. Find `RESEND_FROM_EMAIL` in the list
2. Click **"Edit"** (or the three dots → Edit)
3. **Value:** Change to `Husband Daily Tips <tips@besthusbandever.com>`
4. **Environment:** Make sure it's set for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Step 5: Redeploy
1. Go to **"Deployments"** tab (top menu)
2. Find the latest deployment
3. Click the three dots (⋯) → **"Redeploy"**
4. Or Vercel might automatically redeploy when you save environment variables

---

## ✅ What You Should Have

**In `.env.local`:**
```env
AUTH0_BASE_URL=https://besthusbandever.com
RESEND_FROM_EMAIL=Husband Daily Tips <tips@besthusbandever.com>
```

**In Vercel:**
- `AUTH0_BASE_URL` = `https://besthusbandever.com` (for all environments)
- `RESEND_FROM_EMAIL` = `Husband Daily Tips <tips@besthusbandever.com>` (for all environments)

---

## ⚠️ Important Notes

- **Use `https://`** - Always use `https://` for production domain
- **No trailing slashes** - Don't add `/` at the end
- **Email format** - Use format: `Name <email@domain.com>`
- **Redeploy** - Vercel needs to redeploy for changes to take effect

---

## ✅ When You're Done

Come back and tell me:
- "`.env.local` updated"
- "Vercel environment variables updated"
- "Redeployed" (or "Redeploying")

Then we'll move to Step 6 (Test Everything)!

---

**Go update the environment variables now, then come back!** 🚀


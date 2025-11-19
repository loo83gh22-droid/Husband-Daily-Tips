# Step 4: Update Auth0 Callback URLs

## 🎯 Goal
Update Auth0 to allow login/logout from `besthusbandever.com`

---

## Step-by-Step Instructions

### Step 1: Go to Auth0 Dashboard
1. Go to [auth0.com](https://auth0.com)
2. Log in
3. Click **"Applications"** in the left sidebar
4. Find your **"Husband Daily Tips"** application (or whatever you named it)
5. **Click on the application name** to open it

### Step 2: Go to Settings
1. Click the **"Settings"** tab (should be selected by default)
2. Scroll down to **"Application URIs"** section

### Step 3: Update Callback URLs
Find the **"Allowed Callback URLs"** field.

**Current value might be:**
```
http://localhost:3000/api/auth/callback
```

**Update it to:**
```
http://localhost:3000/api/auth/callback, https://besthusbandever.com/api/auth/callback
```

**Important:** 
- Keep `localhost:3000` for local development
- Add a comma
- Add your new domain with `https://`

### Step 4: Update Logout URLs
Find the **"Allowed Logout URLs"** field.

**Current value might be:**
```
http://localhost:3000
```

**Update it to:**
```
http://localhost:3000, https://besthusbandever.com
```

**Important:**
- Keep `localhost:3000` for local development
- Add a comma
- Add your new domain with `https://`

### Step 5: Update Web Origins
Find the **"Allowed Web Origins"** field.

**Current value might be:**
```
http://localhost:3000
```

**Update it to:**
```
http://localhost:3000, https://besthusbandever.com
```

**Important:**
- Keep `localhost:3000` for local development
- Add a comma
- Add your new domain with `https://`

### Step 6: Save Changes
1. Scroll to the bottom of the page
2. Click **"Save Changes"** button
3. You should see a success message

---

## ✅ What You Should Have

After updating, your Auth0 settings should have:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback, https://besthusbandever.com/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000, https://besthusbandever.com
```

**Allowed Web Origins:**
```
http://localhost:3000, https://besthusbandever.com
```

---

## ⚠️ Important Notes

- **Keep localhost URLs** - You need these for local development
- **Use `https://`** - Always use `https://` for production domain (not `http://`)
- **No trailing slashes** - Don't add `/` at the end of URLs
- **Commas separate URLs** - Use commas to separate multiple URLs

---

## ✅ When You're Done

Come back and tell me:
- "Auth0 callback URLs updated"
- "Changes saved"

Then we'll move to Step 5 (Update Environment Variables)!

---

**Go update Auth0 now, then come back!** 🚀


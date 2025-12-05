# Delete User from Auth0

## The Problem
- User was deleted from Supabase database ✅
- User still exists in Auth0 database ❌
- Auth0 is blocking signup because user already exists

## Solution: Delete User from Auth0

### Step 1: Go to Auth0 User Management

1. **Go to Auth0 Dashboard**
   - Visit: https://manage.auth0.com/
   - Log in

2. **Navigate to User Management → Users**
   - Click "User Management" in left sidebar
   - Click "Users"

### Step 2: Find the User

1. **Search for the user**
   - In the search box, type: `keepitgreen@live.ca`
   - Press Enter

2. **Click on the user** to open their profile

### Step 3: Delete the User

1. **Click the "Actions" button** (three dots menu) in the top right
2. **Click "Delete"**
3. **Confirm deletion** when prompted

**OR**

1. Scroll to the bottom of the user profile page
2. Click the **"Delete User"** button (usually red/destructive)
3. Confirm deletion

### Step 4: Verify Deletion

1. Go back to **User Management → Users**
2. Search for `keepitgreen@live.ca` again
3. Should show "No users found" or empty results

## After Deletion

Once the user is deleted from Auth0:
1. They can sign up fresh with Google
2. Auth0 will create a new user account
3. Your app will create a new user in Supabase
4. Everything will work normally

## Important Notes

- **Auth0 and Supabase are separate databases**
- Deleting from Supabase doesn't delete from Auth0
- Deleting from Auth0 doesn't delete from Supabase
- For a complete reset, you need to delete from both (which we've now done)

## Alternative: Use Auth0 Management API

If you prefer, you can also delete via API, but the dashboard method above is easier.


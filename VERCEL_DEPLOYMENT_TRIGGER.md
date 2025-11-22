# Vercel Deployment Not Triggering? 

If Vercel isn't automatically deploying after pushing to GitHub, try these steps:

## Option 1: Manually Trigger Deployment in Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your project
3. Go to the **Deployments** tab
4. Click **"Redeploy"** on the most recent deployment
5. Or click **"Deploy"** button if available

## Option 2: Check GitHub Integration

1. In Vercel dashboard, go to **Settings** → **Git**
2. Verify that your GitHub repository is connected
3. Check that the correct branch (`main`) is selected
4. Ensure **"Production Branch"** is set to `main`

## Option 3: Check GitHub Webhook

1. Go to your GitHub repository settings
2. Navigate to **Settings** → **Webhooks**
3. Check if there's a Vercel webhook installed
4. If missing, reconnect the repository in Vercel

## Option 4: Force Push (if needed)

If nothing else works, you can try making a small change and pushing again:
```bash
git commit --allow-empty -m "Empty commit to trigger deployment"
git push
```

## Option 5: Disconnect and Reconnect Repository

If webhooks aren't working:
1. In Vercel, go to **Settings** → **Git**
2. Disconnect the repository
3. Reconnect it
4. This will reinstall the webhook


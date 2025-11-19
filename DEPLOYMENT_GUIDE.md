# Deployment Guide - Quick Setup

## ✅ Step 1: Git Repository (COMPLETE)
- ✅ Git initialized
- ✅ Files committed
- ✅ Ready for GitHub push

## Step 2: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click "New repository"** (or go to https://github.com/new)
3. **Repository name**: `husband-daily-tips` (or your preferred name)
4. **Description**: "Daily tips web app for husbands"
5. **Visibility**: Choose Public or Private
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. **Click "Create repository"**

## Step 3: Push to GitHub

After creating the repo, run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd "C:\Users\keepi\OneDrive\Desktop\Coding\Test Project"
git remote add origin https://github.com/YOUR_USERNAME/husband-daily-tips.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "Add New Project"**
3. **Import your GitHub repository** (`husband-daily-tips`)
4. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   AUTH0_SECRET=your-auth0-secret
   AUTH0_BASE_URL=https://your-project.vercel.app
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   
   > **Note**: For `AUTH0_BASE_URL`, use your Vercel URL after first deployment, then update both Vercel env var and Auth0 settings

6. **Click "Deploy"**
7. **Wait for deployment** to complete (usually 1-2 minutes)
8. **Update Auth0 Callback URLs**:
   - Go to Auth0 Dashboard → Applications → Your App → Settings
   - Add to **Allowed Callback URLs**: `https://your-project.vercel.app/api/auth/callback`
   - Add to **Allowed Logout URLs**: `https://your-project.vercel.app`
   - Add to **Allowed Web Origins**: `https://your-project.vercel.app`
   - Save changes
9. **Update Vercel AUTH0_BASE_URL** to match your actual Vercel URL
10. **Redeploy** in Vercel to apply the updated environment variable

### Option B: Via Vercel CLI

```bash
npm i -g vercel
cd "C:\Users\keepi\OneDrive\Desktop\Coding\Test Project"
vercel
```

Follow the prompts to configure your project.

## Step 5: Set Up Automatic Deployments

After first deployment, Vercel will automatically:
- ✅ Deploy every push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Run cron jobs (if configured)

## 📝 Environment Variables Checklist

Make sure all these are set in Vercel:

- [ ] `AUTH0_SECRET`
- [ ] `AUTH0_BASE_URL` (use Vercel URL after deployment)
- [ ] `AUTH0_ISSUER_BASE_URL`
- [ ] `AUTH0_CLIENT_ID`
- [ ] `AUTH0_CLIENT_SECRET`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

## 🔄 Future Updates

After setting up, every time you push to GitHub:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. **Vercel will automatically deploy** within 1-2 minutes

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check `package.json` has all dependencies

### Auth Not Working
- Verify Auth0 callback URLs include your Vercel domain
- Check `AUTH0_BASE_URL` matches your Vercel URL
- Ensure environment variables are correctly set in Vercel

### Database Errors
- Verify Supabase credentials are correct
- Check database migrations have been run
- Ensure Supabase project is active

## ✅ Next Steps After Deployment

1. Test the deployed site
2. Verify authentication works
3. Test daily tips functionality
4. Set up custom domain (optional)
5. Configure email service (optional)


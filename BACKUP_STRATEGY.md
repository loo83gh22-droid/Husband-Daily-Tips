# Backup Strategy

## What Needs to Be Backed Up

### ✅ Already Backed Up (Version Controlled)

1. **Code Repository**
   - ✅ All code is in GitHub
   - ✅ All migrations are in `supabase/migrations/`
   - ✅ Can be restored from GitHub at any time

2. **Database Schema**
   - ✅ All migrations are version controlled
   - ✅ Can recreate schema from migration files

### 🔴 Critical: Needs Backup

1. **Database Data (Supabase)**
   - User accounts and profiles
   - Survey responses
   - Action completions
   - Badges earned
   - Health scores
   - Journal entries
   - All user-generated content

2. **Environment Variables**
   - API keys and secrets
   - Database credentials
   - Service tokens

---

## Backup Solutions

### 1. Supabase Database Backups

**Automatic Backups (Recommended)**
- Supabase provides automatic daily backups on paid plans
- Backups are retained for 7 days (Pro plan) or 30 days (Team plan)
- Point-in-time recovery available

**Manual Backups**
You can create manual backups via Supabase Dashboard:

1. Go to Supabase Dashboard → Your Project → Database → Backups
2. Click "Create Backup" for on-demand backup
3. Download SQL dump if needed

**SQL Dump (Manual)**
```bash
# Using Supabase CLI (if installed)
supabase db dump -f backup_$(date +%Y%m%d).sql

# Or use pg_dump directly
pg_dump -h [your-db-host] -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

**Recommended Schedule:**
- ✅ Daily automatic backups (Supabase handles this)
- ✅ Weekly manual SQL dump (download and store securely)
- ✅ Before major migrations or updates

### 2. Environment Variables Backup

**Current Storage:**
- Vercel Dashboard → Settings → Environment Variables
- `.env.local` (local development - already in .gitignore ✅)

**Backup Method:**
1. **Document all variables** (see `ENVIRONMENT_VARIABLES.md` below)
2. **Export from Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Manually copy or use Vercel CLI: `vercel env pull .env.local`
   - Store securely (password manager, encrypted file)

**⚠️ Security Warning:**
- Never commit `.env` files to Git (already in .gitignore ✅)
- Store backups in encrypted password manager (1Password, LastPass, etc.)
- Don't share via email or unsecured channels

### 3. Code Repository Backup

**Already Handled:**
- ✅ Code is in GitHub
- ✅ All migrations are version controlled
- ✅ Can restore from any commit

**Additional Safety:**
- Consider mirroring to another Git provider (GitLab, Bitbucket)
- Or create periodic archive downloads

---

## Backup Checklist

### Daily (Automatic)
- [x] Supabase automatic daily backup (if on paid plan)
- [x] Code changes pushed to GitHub

### Weekly (Manual)
- [ ] Download Supabase SQL dump
- [ ] Verify backup integrity
- [ ] Store backup in secure location (encrypted)

### Monthly (Manual)
- [ ] Review and test restore procedure
- [ ] Update environment variables documentation
- [ ] Verify all critical data is backed up

### Before Major Changes
- [ ] Create manual database backup
- [ ] Document current state
- [ ] Test rollback procedure

---

## Restore Procedure

### Restore Database from Backup

**Via Supabase Dashboard:**
1. Go to Database → Backups
2. Select backup point
3. Click "Restore" (creates new database)
4. Or download SQL and restore manually

**Via SQL Dump:**
```bash
# Restore from SQL file
psql -h [your-db-host] -U postgres -d postgres < backup_20241124.sql
```

### Restore Code
```bash
# Clone from GitHub
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

### Restore Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add each variable manually
3. Or use Vercel CLI: `vercel env pull`

---

## Critical Data to Protect

### High Priority
1. **User Accounts** - Email, names, subscription status
2. **Survey Responses** - All user feedback and responses
3. **Action Completions** - User progress and streaks
4. **Health Scores** - Relationship health tracking
5. **Journal Entries** - User reflections

### Medium Priority
1. **Badges Earned** - User achievements
2. **Challenges** - User challenge participation
3. **Favorites** - User-saved actions

### Low Priority (Can be regenerated)
1. **Actions/Tips** - Content can be recreated from migrations
2. **Badges** - Definitions in migrations
3. **Marketing Messages** - Can be recreated

---

## Recommended Backup Tools

### For Database
- ✅ **Supabase Automatic Backups** (if on paid plan)
- ✅ **Supabase CLI** for manual dumps
- ✅ **pg_dump** for PostgreSQL backups

### For Environment Variables
- ✅ **1Password / LastPass** (password manager)
- ✅ **Vercel CLI** (`vercel env pull`)
- ✅ **Encrypted file storage**

### For Code
- ✅ **GitHub** (already in use)
- ✅ **GitLab / Bitbucket** (optional mirror)

---

## Disaster Recovery Plan

### Scenario 1: Database Corruption
1. Stop application (prevent further damage)
2. Restore from most recent backup
3. Verify data integrity
4. Resume operations

### Scenario 2: Accidental Data Deletion
1. Identify what was deleted
2. Restore from backup
3. Re-sync any changes made after backup
4. Verify restoration

### Scenario 3: Environment Variables Lost
1. Access password manager backup
2. Re-add all variables to Vercel
3. Restart application
4. Verify functionality

### Scenario 4: Code Repository Issues
1. Clone fresh from GitHub
2. Restore environment variables
3. Re-deploy to Vercel
4. Verify deployment

---

## Current Backup Status

### ✅ In Place
- Code version control (GitHub)
- Database migrations (version controlled)
- Environment variables in Vercel
- `.env.local` in `.gitignore` (secure)

### ⚠️ Needs Setup
- [ ] Verify Supabase backup plan (check if automatic backups are enabled)
- [ ] Create first manual SQL dump
- [ ] Document all environment variables securely
- [ ] Test restore procedure

---

## Quick Actions

### Right Now
1. **Check Supabase Backup Status:**
   - Go to Supabase Dashboard → Database → Backups
   - Verify automatic backups are enabled (if on paid plan)
   - If on free plan, set up weekly manual backups

2. **Create Environment Variables Backup:**
   - Export from Vercel Dashboard
   - Store in password manager
   - Document in secure location

3. **Create First Database Backup:**
   - Download SQL dump from Supabase
   - Store securely
   - Verify it's complete

### This Week
1. Set up weekly backup reminder
2. Test restore procedure
3. Document backup locations

---

## Cost Considerations

### Supabase Backups
- **Free Plan:** No automatic backups (manual only)
- **Pro Plan ($25/month):** Daily backups, 7-day retention
- **Team Plan ($599/month):** Daily backups, 30-day retention

**Recommendation:** If on free plan, set up weekly manual backups. Consider upgrading to Pro plan for automatic backups if you have paying customers.

---

## Questions to Answer

1. **What's your Supabase plan?** (Free/Pro/Team)
2. **How often do you want manual backups?** (Weekly recommended)
3. **Where will you store backups?** (Encrypted storage, password manager)
4. **Who has access to backups?** (Document access control)

---

## Next Steps

1. ✅ Review this document
2. ⬜ Check Supabase backup status
3. ⬜ Create first manual backup
4. ⬜ Document environment variables
5. ⬜ Set up backup schedule/reminders
6. ⬜ Test restore procedure


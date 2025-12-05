# DMARC Report Email Fix

## What Was Happening

You received an email notification showing an "Unknown User" reply from `dmarcreport@microsoft.com` with subject "Report Domain: besthusbandever.com". This was **not a user reply** - it was an **automated DMARC report** from Microsoft.

## What Are DMARC Reports?

**DMARC (Domain-based Message Authentication, Reporting & Conformance)** reports are automated emails sent by email providers (Microsoft, Google, etc.) to domain owners. They help you:

1. **Monitor email authentication** - Check if your emails pass SPF, DKIM, and DMARC checks
2. **Identify issues** - Spot if someone is spoofing your domain
3. **Improve deliverability** - See which providers are accepting/rejecting your emails

These reports are **automated** and come from addresses like:
- `dmarcreport@microsoft.com`
- `dmarc@google.com`
- `postmaster@...`
- `mailer-daemon@...`

## The Problem

The email reply system was treating DMARC reports as user replies because:
1. They come through the Resend Inbound webhook (same as user replies)
2. The system couldn't distinguish automated emails from real user replies
3. They were stored as "unknown_user" and forwarded to you

## The Fix

I've added **automated email filtering** to the webhook handler that:

1. **Detects automated emails** by checking:
   - Email addresses (dmarcreport@, dmarc@, postmaster@, etc.)
   - Email domains (@microsoft.com, @protection.outlook.com, etc.)
   - Subject lines (contains "Report Domain:", "DMARC", "Report-ID:", etc.)

2. **Filters them out** before processing as user replies:
   - Stores them with status `automated_email` (for record-keeping)
   - Does NOT forward them to admin
   - Does NOT show them as "Unknown User" notifications
   - Returns success response (so Resend doesn't retry)

3. **Database update**:
   - Added `automated_email` as a valid status in the `email_replies` table
   - Migration: `140_add_automated_email_status.sql`

## What This Means

✅ **DMARC reports will no longer:**
- Show up as "Unknown User" notifications
- Be forwarded to your admin email
- Clutter your email reply dashboard

✅ **DMARC reports will still:**
- Be stored in the database (for audit purposes)
- Be accessible if you need to review them
- Be marked with `status = 'automated_email'`

## Other Automated Emails Filtered

The system now also filters:
- **Bounce messages** (mailer-daemon@, bounce@)
- **Postmaster messages** (postmaster@)
- **No-reply emails** (noreply@, no-reply@)
- **Security/abuse emails** (security@, abuse@)
- **Email provider reports** (@microsoft.com, @google.com, etc.)

## Next Steps

1. **Run the migration** in Supabase:
   ```sql
   -- Run: supabase/migrations/140_add_automated_email_status.sql
   ```

2. **Deploy the code changes** - The webhook handler now filters automated emails

3. **Test** - Future DMARC reports will be filtered automatically

## Viewing DMARC Reports (If Needed)

If you ever need to review DMARC reports, you can query the database:

```sql
SELECT * FROM email_replies 
WHERE status = 'automated_email' 
ORDER BY received_at DESC;
```

## About DMARC Reports

DMARC reports are **normal and expected**. They're sent daily/weekly by email providers to help you monitor your domain's email authentication. You can:

- **Ignore them** - They're just informational
- **Review them** - Check if your emails are passing authentication
- **Use a DMARC analyzer** - Tools like dmarcian.com or postmarkapp.com can parse these reports

The important thing is they're no longer cluttering your user reply notifications! 🎉


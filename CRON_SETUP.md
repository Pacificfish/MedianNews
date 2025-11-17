# Cron Job Setup Guide

## Overview

The website automatically updates twice daily (at 6 AM and 6 PM UTC) to discover new political topics and articles, then rebuilds the homepage with the latest content.

## Cron Job Configuration

### Vercel Cron Jobs

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/discover-and-update",
      "schedule": "0 6,18 * * *"
    }
  ]
}
```

**Schedule**: `0 6,18 * * *` means:
- Runs at 6:00 AM UTC (00:00)
- Runs at 6:00 PM UTC (18:00)
- Every day

### What the Cron Job Does

1. **Discovers New Topics & Articles** (`/api/discover-articles`)
   - Uses AI to find current political topics
   - Searches Google News for articles about those topics
   - Classifies each article's political bias (Left/Center/Right)
   - Saves topics and articles to the database

2. **Rebuilds Homepage** (`/api/rebuild-homepage`)
   - Processes recent topics (last 24 hours)
   - Selects best articles from each political perspective
   - Calculates importance scores
   - Updates the `homepage_topics` table
   - Removes topics older than 48 hours

## Environment Variables Required

Make sure these are set in your Vercel project:

```env
CRON_SECRET=your_random_secret_string
NEXT_PUBLIC_SITE_URL=https://your-domain.com
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setting Up in Vercel

1. **Deploy your project** to Vercel
2. **Add environment variables** in Vercel Dashboard > Settings > Environment Variables
3. **Verify cron job** in Vercel Dashboard > Settings > Cron Jobs
   - The cron job should appear automatically from `vercel.json`
   - Make sure it's enabled

## Manual Testing

You can manually trigger the cron job for testing:

```bash
# Using curl
curl -X GET "https://your-domain.com/api/cron/discover-and-update" \
  -H "Authorization: Bearer your_cron_secret"
```

Or visit the endpoint in your browser (if running locally):
```
http://localhost:3000/api/cron/discover-and-update
```

## Monitoring

Check Vercel logs to monitor cron job execution:
- Go to Vercel Dashboard > Your Project > Logs
- Filter by "Cron" to see cron job logs
- Look for success/error messages

## Troubleshooting

### Cron job not running
- Verify `vercel.json` is in the root directory
- Check that the cron job appears in Vercel Dashboard
- Ensure `CRON_SECRET` is set correctly
- Check Vercel logs for errors

### Authorization errors
- Verify `CRON_SECRET` matches in environment variables
- Check that the Authorization header is being sent correctly

### Discovery/rebuild errors
- Check OpenAI API key is valid and has quota
- Verify Supabase connection and permissions
- Review error logs in Vercel Dashboard

## Changing the Schedule

To change when the cron job runs, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/discover-and-update",
      "schedule": "0 8,20 * * *"  // 8 AM and 8 PM UTC
    }
  ]
}
```

Cron schedule format: `minute hour day month weekday`
- `0 6,18 * * *` = 6 AM and 6 PM every day
- `0 */12 * * *` = Every 12 hours
- `0 0 * * *` = Once daily at midnight


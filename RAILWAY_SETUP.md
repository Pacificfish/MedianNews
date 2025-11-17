# Railway Deployment Guide

## Overview

This guide will help you deploy Median News to Railway and set up automatic daily updates.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account (for connecting your repository)
- Supabase project
- OpenAI API key
- Stripe account (optional, for payments)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

## Step 2: Deploy to Railway

1. **Create a new project in Railway**:
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure the service**:
   - Railway will auto-detect Next.js
   - It will automatically set up build and start commands

## Step 3: Set Environment Variables

In Railway Dashboard, go to your service → Variables and add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_PRICE_ID=your_stripe_price_id
NEXT_PUBLIC_STRIPE_PRICE_AMOUNT=5
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
CRON_SECRET=your_random_secret_string

# Enable Cron Jobs
ENABLE_CRON=true
NODE_ENV=production
```

**Important**: 
- Set `ENABLE_CRON=true` to enable automatic updates
- Set `NEXT_PUBLIC_SITE_URL` to your Railway app URL (Railway will provide this)
- Generate a secure random string for `CRON_SECRET`

## Step 4: Configure Build Settings

Railway should auto-detect Next.js, but verify these settings:

- **Build Command**: `npm run build` (or `npm ci && npm run build`)
- **Start Command**: `npm start`
- **Root Directory**: `/` (root)

## Step 5: Initialize Cron Jobs

Cron jobs will automatically start when the server starts (if `ENABLE_CRON=true`).

You can also manually trigger initialization by calling:
```
GET https://your-app.railway.app/api/cron/init
```

## Step 6: Verify Deployment

1. **Check your app is running**:
   - Visit your Railway app URL
   - You should see the Median News homepage

2. **Test cron jobs**:
   - Check Railway logs for "Cron jobs initialized successfully"
   - Manually trigger: `GET /api/cron/discover-and-update` with Authorization header

3. **Monitor logs**:
   - Railway Dashboard → Your Service → Deployments → View Logs
   - Look for cron job execution messages at 6 AM and 6 PM UTC

## Cron Job Schedule

The cron jobs run **twice daily**:
- **6:00 AM UTC** (00:00)
- **6:00 PM UTC** (18:00)

This schedule is defined in `lib/cron.ts` and can be modified if needed.

## Custom Domain (Optional)

1. In Railway Dashboard → Your Service → Settings → Networking
2. Click "Generate Domain" or add your custom domain
3. Update `NEXT_PUBLIC_SITE_URL` environment variable to match

## Monitoring

### View Logs
- Railway Dashboard → Your Service → Deployments → View Logs
- Filter for "cron" to see cron job activity

### Check Cron Job Status
- Look for log messages like:
  - "Cron jobs initialized successfully"
  - "Running scheduled article discovery and update..."
  - "Cron job completed successfully"

### Manual Trigger
You can manually trigger the update:
```bash
curl -X GET "https://your-app.railway.app/api/cron/discover-and-update" \
  -H "Authorization: Bearer your_cron_secret"
```

## Troubleshooting

### Cron jobs not running
1. Verify `ENABLE_CRON=true` is set
2. Check logs for initialization messages
3. Ensure `NEXT_PUBLIC_SITE_URL` is correct
4. Verify `CRON_SECRET` matches in all requests

### Build failures
1. Check Railway logs for build errors
2. Verify all dependencies are in `package.json`
3. Ensure Node.js version is compatible (18+)

### Environment variable issues
1. Double-check all variables are set correctly
2. Restart the service after adding new variables
3. Verify no typos in variable names

### Database connection issues
1. Verify Supabase credentials are correct
2. Check Supabase project is active
3. Ensure IP allowlist includes Railway IPs (if configured)

## Cost Considerations

Railway pricing:
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

The app will run continuously to keep cron jobs active. Consider:
- Using Railway's sleep feature (cron jobs won't run when sleeping)
- Or use an external cron service like EasyCron or cron-job.org

## Alternative: External Cron Service

If you prefer not to keep the app running 24/7, you can use an external cron service:

1. **Set up EasyCron or cron-job.org**:
   - URL: `https://your-app.railway.app/api/cron/discover-and-update`
   - Schedule: `0 6,18 * * *` (6 AM and 6 PM UTC)
   - Method: GET
   - Headers: `Authorization: Bearer your_cron_secret`

2. **Disable internal cron**:
   - Set `ENABLE_CRON=false` in Railway
   - The external service will trigger updates

## Next Steps

- Set up monitoring/alerting
- Configure custom domain
- Set up analytics
- Review and optimize costs


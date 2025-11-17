# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file with the following variables (see `.env.example` for reference):
   - Supabase credentials
   - OpenAI API key
   - Stripe keys
   - Site URL
   - Cron secret

3. **Set up Supabase**
   - Create a new Supabase project
   - Run `supabase/schema.sql` in the SQL editor
   - Run `scripts/seed-sources.sql` to seed initial sources
   - Enable the `vector` extension if not already enabled

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Database Setup

### 1. Create Supabase Project
- Go to https://supabase.com
- Create a new project
- Note your project URL and anon key

### 2. Run Schema
- Open the SQL Editor in Supabase
- Copy and paste the contents of `supabase/schema.sql`
- Execute the script

### 3. Seed Sources
- In the SQL Editor, run `scripts/seed-sources.sql`
- This will add 50+ news sources across the political spectrum

### 4. Configure RLS
The schema includes RLS policies, but you may need to:
- Verify policies are enabled
- Test with anon key that public read access works
- Ensure service role key has full access

## Stripe Setup

1. **Create Products**
   - Go to Stripe Dashboard > Products
   - Create a "Pro" subscription product
   - Set price (e.g., $5/month)
   - Copy the Price ID

2. **Set up Webhook**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret

3. **Add to Environment**
   - Add `STRIPE_WEBHOOK_SECRET` to your `.env.local`

## Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Import project from GitHub
   - Add all environment variables
   - Deploy

3. **Set up Cron Jobs**
   - Vercel will automatically detect `vercel.json`
   - Cron jobs will run at specified intervals
   - Ensure `CRON_SECRET` is set in environment variables
   - Update cron job authorization headers in Vercel dashboard

## Testing

### Test URL Analyzer
1. Go to `/analyze`
2. Enter a news article URL
3. Verify bias classification appears

### Test Trending Feed
1. Go to `/`
2. Verify topics appear (may be empty initially)
3. Wait for ingestion cron to run

### Test Compare Mode
1. Click on a topic from the feed
2. Verify 3-column layout appears
3. Check AI summary is generated

### Test Admin
1. Go to `/admin/sources`
2. Add a new source
3. Verify it appears in the list

## Troubleshooting

### "No topics yet"
- Wait for ingestion cron to run (every 5 minutes)
- Check `/api/ingest` endpoint manually with proper auth
- Verify sources are active in admin panel

### OpenAI errors
- Verify API key is correct
- Check API quota/limits
- Review error logs in Vercel

### Supabase connection issues
- Verify environment variables
- Check Supabase project is active
- Test connection with Supabase client

### Stripe checkout not working
- Verify Stripe keys are correct
- Check webhook endpoint is accessible
- Review Stripe dashboard for errors

## Next Steps

- Set up monitoring/alerting
- Configure custom domain
- Set up analytics
- Add more news sources
- Fine-tune ranking algorithm
- Add more admin features




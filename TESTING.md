# Testing Guide

## Quick Test Checklist

### ✅ Database Setup
- [x] Schema.sql run successfully
- [ ] Seed sources script run (50+ news sources)
- [ ] Verify tables exist in Supabase dashboard

### ✅ Environment Variables
- [x] Supabase URL configured
- [x] Supabase keys configured  
- [x] OpenAI API key configured
- [ ] Stripe keys (optional - can skip for now)

## Testing Features

### 1. Test URL Analyzer (Requires OpenAI)
1. Go to http://localhost:3000/analyze
2. Enter a news article URL (e.g., from CNN, BBC, Fox News)
3. Click "Analyze"
4. Should see:
   - Article title and source
   - Bias classification (Left/Center/Right)
   - Confidence score
   - Explanation

**Test URLs:**
- https://www.cnn.com/2024/01/15/politics/example-article
- https://www.bbc.com/news/world-us-canada
- https://www.foxnews.com/politics

### 2. Test Homepage
1. Go to http://localhost:3000
2. Should see:
   - "No topics yet" (if no data)
   - OR topic clusters (after ingestion runs)

### 3. Test Authentication
1. Go to http://localhost:3000/register
2. Create an account
3. Should redirect to login
4. Login with credentials
5. Should see profile link in navbar

### 4. Test Profile/Bias Tracker
1. Login first
2. Go to http://localhost:3000/profile
3. Should see:
   - "No reading history yet" (if no articles read)
   - Charts and stats (after reading articles)

### 5. Test Admin Panel
1. Login first
2. Go to http://localhost:3000/admin/sources
3. Should see list of sources (after seed script)
4. Can add/edit sources

## Manual Ingestion Test

To test ingestion without waiting for cron:

1. Make a GET request to `/api/ingest` with authorization header:
```bash
curl -X GET http://localhost:3000/api/ingest \
  -H "Authorization: Bearer local_dev_secret"
```

Or use Postman/Insomnia with:
- Method: GET
- URL: http://localhost:3000/api/ingest
- Header: `Authorization: Bearer local_dev_secret`

This will:
- Fetch RSS feeds from active sources
- Parse articles
- Classify bias
- Create topics/clusters

## Common Issues

### "No topics yet"
- Run seed script to add sources
- Manually trigger ingestion API
- Wait a few minutes for cron (if deployed)

### OpenAI API errors
- Check API key is correct
- Verify you have credits/quota
- Check rate limits

### Supabase connection errors
- Verify URL and keys in .env.local
- Check Supabase project is active
- Verify RLS policies are set correctly

### Authentication not working
- Check Supabase Auth is enabled
- Verify email provider is configured
- Check browser console for errors

## Next Steps After Testing

1. **Set up Stripe** (when ready):
   - Create products in Stripe dashboard
   - Add webhook endpoint
   - Test checkout flow

2. **Deploy to Vercel**:
   - Push to GitHub
   - Import to Vercel
   - Add environment variables
   - Set up cron jobs

3. **Add more sources**:
   - Use admin panel to add sources
   - Or update seed script

4. **Fine-tune ranking**:
   - Adjust weights in `/api/rank`
   - Monitor engagement metrics




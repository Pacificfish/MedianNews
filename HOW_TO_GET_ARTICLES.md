# How to Get News Articles into Median News

## Quick Start

### Step 1: Seed News Sources (One-time setup)

First, make sure you have news sources in your database:

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Open the file `scripts/seed-sources.sql`
3. Copy and paste the entire SQL into the editor
4. Click **Run** to execute

This will add 50+ news sources (CNN, BBC, Fox News, etc.) with their RSS feeds.

**Verify sources were added:**
- Go to Supabase Dashboard → **Table Editor** → `sources` table
- You should see rows with news sources

### Step 2: Test Ingestion Manually

#### Option A: Using the Test Script

```bash
# Make the script executable
chmod +x scripts/test-ingestion.sh

# Run it
./scripts/test-ingestion.sh
```

#### Option B: Using curl

```bash
curl -X GET http://localhost:3000/api/ingest \
  -H "Authorization: Bearer local_dev_secret"
```

#### Option C: Using Browser (Local Development)

For local development, you can also just visit:
```
http://localhost:3000/api/ingest
```

The endpoint will:
1. Fetch RSS feeds from all active sources
2. Parse articles (title, summary, URL, published date)
3. Insert articles into the database
4. Classify bias (using source bias for now)
5. Return a summary of how many articles were processed

### Step 3: Check Results

After running ingestion:

1. **Check Supabase Dashboard:**
   - Go to **Table Editor** → `articles` table
   - You should see new articles being added
   - Check `topics` table for topic clusters
   - Check `topic_members` to see articles grouped by topic

2. **Check Your Homepage:**
   - Go to `http://localhost:3000`
   - You should see topic clusters appearing!

## How It Works

### The Ingestion Process

1. **Fetches Active Sources**
   - Gets all sources from database where `active = true`
   - Each source has an `rss_url` (RSS feed URL)

2. **Parses RSS Feeds**
   - Uses `rss-parser` to fetch and parse each RSS feed
   - Gets the latest 10 articles from each feed
   - Extracts: title, link, description, published date

3. **Saves Articles**
   - Checks if article already exists (by hash)
   - Inserts new articles into `articles` table
   - Links articles to their source

4. **Classifies Bias**
   - Uses source's `bias_label` as initial classification
   - (Later: Can use OpenAI to refine classification)

5. **Creates Topics**
   - Groups related articles into topics
   - Assigns articles to Left/Center/Right sides
   - (Currently simplified - will improve with embeddings)

### Automatic Ingestion (Production)

Once deployed to Vercel:

1. **Cron Jobs Run Automatically:**
   - Ingestion: Every 5 minutes (`/api/ingest`)
   - Ranking: Every 2 minutes (`/api/rank`)

2. **Set Environment Variable:**
   - In Vercel dashboard, add `CRON_SECRET` environment variable
   - Use a random secure string

3. **Vercel Cron Configuration:**
   - Already configured in `vercel.json`
   - Will automatically set up when you deploy

## Troubleshooting

### "No sources found"
- Make sure you ran the seed script
- Check Supabase `sources` table has rows
- Verify sources have `active = true`

### "RSS feed errors"
- Some RSS feeds may be invalid or require authentication
- Check browser console for specific errors
- Invalid feeds will be skipped, others will continue

### "No articles appearing"
- Check Supabase `articles` table
- Verify articles are being inserted
- Check for errors in the API response

### "Topics not showing"
- Articles need to be grouped into topics
- This happens automatically during ingestion
- May need to run ranking endpoint: `/api/rank`

## Manual Testing

### Test a Single Source

You can test with just one source by temporarily setting others to inactive:

```sql
-- In Supabase SQL Editor
UPDATE sources SET active = false;
UPDATE sources SET active = true WHERE name = 'BBC News';
```

Then run ingestion - it will only process BBC News.

### Check Ingestion Status

```bash
# Check how many articles were processed
curl http://localhost:3000/api/ingest | jq
```

Response will show:
```json
{
  "success": true,
  "processed": 50,
  "inserted": 45,
  "errors": 5
}
```

## Next Steps

1. ✅ Seed sources
2. ✅ Test ingestion manually
3. ✅ Verify articles in database
4. ⏭️ Deploy to Vercel for automatic ingestion
5. ⏭️ Improve topic clustering
6. ⏭️ Add OpenAI bias classification during ingestion

## Adding More Sources

### Via Admin Panel (Recommended)
1. Go to `http://localhost:3000/admin/sources`
2. Click "Add Source"
3. Fill in:
   - Name: e.g., "The New York Times"
   - Home URL: `https://www.nytimes.com`
   - RSS URL: `https://www.nytimes.com/svc/collections/v1/publish/.../rss.xml`
   - Bias Label: Left/Center/Right
   - Authority Score: 0.0-1.0

### Via SQL
```sql
INSERT INTO sources (name, home_url, rss_url, bias_label, authority_score, country, language, active)
VALUES ('Source Name', 'https://example.com', 'https://example.com/feed.xml', 'Center', 0.8, 'US', 'en', true);
```

---

**Ready to test?** Run the ingestion endpoint and check your Supabase dashboard!


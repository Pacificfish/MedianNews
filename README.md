# Median News

**See every story clearly.**

Median News is a web-first news product that shows political bias for any news article (Left / Center / Right), groups related coverage into topics, and lets users compare how different sides frame the same story.

## Features

- **URL Analyzer**: Analyze any news article URL to see its political bias classification
- **Trending Feed**: Server-rendered list of top topic clusters showing coverage from all sides
- **Compare Mode**: Side-by-side comparison of how Left, Center, and Right sources cover the same story
- **Bias Tracker**: Personal analytics showing your reading patterns and bias distribution
- **Social Layer**: Comments and upvotes on topics
- **Pro Tier**: Unlimited analyses, personal analytics, and priority queue

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **State/Forms**: React Hook Form + Zod
- **Auth/DB/Storage**: Supabase (Row Level Security, SQL)
- **Payments**: Stripe Checkout
- **AI**: OpenAI (bias classification, summaries)
- **Parsing**: RSS/Atom + Cheerio
- **Hosting**: Vercel (edge-friendly); Vercel Cron for ingestion/ranking

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key
- Stripe account (for payments)
- Vercel account (for deployment)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_PRICE_ID=your_stripe_price_id
NEXT_PUBLIC_STRIPE_PRICE_AMOUNT=5

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cron (for Vercel Cron jobs)
CRON_SECRET=your_random_secret_string
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
3. Seed initial sources by running `scripts/seed-sources.sql`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Vercel Cron Jobs

Set up these cron jobs in your Vercel project:

1. **Ingestion** (every 5 minutes):
   - Path: `/api/ingest`
   - Schedule: `*/5 * * * *`
   - Authorization: Bearer token with `CRON_SECRET`

2. **Ranking** (every 2 minutes):
   - Path: `/api/rank`
   - Schedule: `*/2 * * * *`
   - Authorization: Bearer token with `CRON_SECRET`

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── analyze/           # URL analyzer page
│   ├── topic/[id]/        # Compare mode page
│   ├── profile/           # User bias tracker
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase clients
│   ├── openai.ts         # OpenAI integration
│   └── ...
├── supabase/             # Database schema
└── scripts/              # Seed scripts
```

## Key Features Implementation

### Bias Classification

Articles are classified using OpenAI GPT-4 with a structured prompt that returns:
- Leaning: Left, Center, or Right
- Score: 0-100 (0=Left, 50=Center, 100=Right)
- Confidence: 0-100
- Explanation: 1-2 sentence rationale

### Topic Clustering

Articles are grouped into topics based on:
- Embedding similarity (OpenAI embeddings)
- Incremental clustering with cosine distance threshold
- Side assignment based on article bias

### Ranking Algorithm

Topics are ranked using weighted signals:
- Recency (30%): Exponential decay from publish time
- Authority (25%): Source authority score
- Coverage (20%): Number of distinct sources per topic
- Engagement (10%): Views/clicks/dwell time
- Geo (5%): Geographic relevance
- Novelty (10%): Penalty for near-duplicates

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase

1. Create project at supabase.com
2. Run schema SQL
3. Seed sources
4. Configure RLS policies

### Stripe

1. Create products and prices in Stripe Dashboard
2. Set up webhook endpoint: `/api/webhooks/stripe`
3. Configure redirect URLs

## License

MIT




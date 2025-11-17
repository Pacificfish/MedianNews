-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension (for embeddings) - may need to be enabled in Supabase dashboard
-- If this fails, you can enable it manually in Supabase Dashboard > Database > Extensions
CREATE EXTENSION IF NOT EXISTS "vector";

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  home_url TEXT NOT NULL,
  rss_url TEXT NOT NULL,
  bias_label TEXT NOT NULL CHECK (bias_label IN ('Left', 'Center', 'Right', 'Center-Left', 'Center-Right')),
  authority_score FLOAT DEFAULT 0.5 CHECK (authority_score >= 0 AND authority_score <= 1),
  country TEXT DEFAULT 'US',
  language TEXT DEFAULT 'en',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop index if exists to avoid conflicts
DROP INDEX IF EXISTS idx_sources_active_authority;
CREATE INDEX idx_sources_active_authority ON sources(active, authority_score DESC);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  url TEXT NOT NULL UNIQUE,
  canonical_url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content_excerpt TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  lang TEXT DEFAULT 'en',
  hash TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop indexes if exists
DROP INDEX IF EXISTS idx_articles_published_at;
DROP INDEX IF EXISTS idx_articles_hash;
DROP INDEX IF EXISTS idx_articles_embedding;

CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_hash ON articles(hash);

-- Only create embedding index if vector extension is available
-- If this fails, comment it out - embeddings will still work, just slower queries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE INDEX idx_articles_embedding ON articles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create embedding index. Vector extension may not be available.';
END $$;

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  centroid vector(1536),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  blindspot_side TEXT CHECK (blindspot_side IN ('Left', 'Center', 'Right')),
  cluster_hash TEXT
);

DROP INDEX IF EXISTS idx_topics_last_seen_at;
CREATE INDEX idx_topics_last_seen_at ON topics(last_seen_at DESC);

-- Topic members table
CREATE TABLE IF NOT EXISTS topic_members (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  side_label TEXT NOT NULL CHECK (side_label IN ('Left', 'Center', 'Right')),
  PRIMARY KEY (topic_id, article_id)
);

DROP INDEX IF EXISTS idx_topic_members_topic_side;
CREATE INDEX idx_topic_members_topic_side ON topic_members(topic_id, side_label);

-- Bias scores table
CREATE TABLE IF NOT EXISTS bias_scores (
  article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  leaning TEXT NOT NULL CHECK (leaning IN ('Left', 'Center', 'Right')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rank signals table
CREATE TABLE IF NOT EXISTS rank_signals (
  article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  recency FLOAT DEFAULT 0,
  authority FLOAT DEFAULT 0,
  coverage FLOAT DEFAULT 0,
  engagement FLOAT DEFAULT 0,
  geo FLOAT DEFAULT 0,
  novelty FLOAT DEFAULT 0,
  total_score FLOAT DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_rank_signals_total_score;
CREATE INDEX idx_rank_signals_total_score ON rank_signals(total_score DESC);

-- User reads table
CREATE TABLE IF NOT EXISTS user_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ DEFAULT NOW(),
  dwell_ms INTEGER
);

DROP INDEX IF EXISTS idx_user_reads_user_ts;
CREATE INDEX idx_user_reads_user_ts ON user_reads(user_id, ts DESC);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_comments_topic_created;
CREATE INDEX idx_comments_topic_created ON comments(topic_id, created_at DESC);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'free',
  active BOOLEAN DEFAULT false,
  current_period_end TIMESTAMPTZ
);

-- Homepage topics table (materialized/updated daily)
CREATE TABLE IF NOT EXISTS homepage_topics (
  topic_id UUID PRIMARY KEY REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  left_article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  center_article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  right_article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  blindspot_side TEXT CHECK (blindspot_side IN ('Left', 'Center', 'Right')),
  importance_score FLOAT DEFAULT 0,
  built_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_homepage_topics_importance;
CREATE INDEX idx_homepage_topics_importance ON homepage_topics(importance_score DESC);

-- Drop materialized view if exists
DROP MATERIALIZED VIEW IF EXISTS top_clusters CASCADE;

-- Materialized view for top clusters
CREATE MATERIALIZED VIEW top_clusters AS
SELECT 
  t.id AS topic_id,
  t.title,
  t.last_seen_at,
  (SELECT tm_left.article_id FROM topic_members tm_left 
   WHERE tm_left.topic_id = t.id AND tm_left.side_label = 'Left' 
   LIMIT 1) AS left_article_id,
  (SELECT tm_center.article_id FROM topic_members tm_center 
   WHERE tm_center.topic_id = t.id AND tm_center.side_label = 'Center' 
   LIMIT 1) AS center_article_id,
  (SELECT tm_right.article_id FROM topic_members tm_right 
   WHERE tm_right.topic_id = t.id AND tm_right.side_label = 'Right' 
   LIMIT 1) AS right_article_id,
  COALESCE(AVG(rs.total_score), 0) AS importance_score
FROM topics t
LEFT JOIN topic_members tm ON t.id = tm.topic_id
LEFT JOIN rank_signals rs ON tm.article_id = rs.article_id
GROUP BY t.id, t.title, t.last_seen_at;

DROP INDEX IF EXISTS idx_top_clusters_importance;
DROP INDEX IF EXISTS idx_top_clusters_last_seen;
CREATE INDEX idx_top_clusters_importance ON top_clusters(importance_score DESC);
CREATE INDEX idx_top_clusters_last_seen ON top_clusters(last_seen_at DESC);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bias_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_topics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Public can read sources" ON sources;
DROP POLICY IF EXISTS "Public can read articles" ON articles;
DROP POLICY IF EXISTS "Public can read topics" ON topics;
DROP POLICY IF EXISTS "Public can read topic_members" ON topic_members;
DROP POLICY IF EXISTS "Public can read bias_scores" ON bias_scores;
DROP POLICY IF EXISTS "Public can read rank_signals" ON rank_signals;
DROP POLICY IF EXISTS "Public can read comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own reads" ON user_reads;
DROP POLICY IF EXISTS "Users can read their own reads" ON user_reads;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can read their own subscription" ON subscriptions;

-- Public read access
CREATE POLICY "Public can read sources" ON sources FOR SELECT USING (true);
CREATE POLICY "Public can read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public can read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public can read topic_members" ON topic_members FOR SELECT USING (true);
CREATE POLICY "Public can read bias_scores" ON bias_scores FOR SELECT USING (true);
CREATE POLICY "Public can read rank_signals" ON rank_signals FOR SELECT USING (true);
CREATE POLICY "Public can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public can read homepage_topics" ON homepage_topics FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can insert their own reads" ON user_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own reads" ON user_reads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (handled via service role key, not RLS)
-- Admin operations should use service role key

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_top_clusters()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY top_clusters;
EXCEPTION
  WHEN OTHERS THEN
    -- If CONCURRENTLY fails (e.g., no unique index), try without it
    REFRESH MATERIALIZED VIEW top_clusters;
END;
$$ LANGUAGE plpgsql;

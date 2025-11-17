-- User features tables for saved topics, hidden topics, and reading history

-- Saved topics table
CREATE TABLE IF NOT EXISTS saved_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_topics_user ON saved_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_topics_topic ON saved_topics(topic_id);

-- Hidden topics table
CREATE TABLE IF NOT EXISTS hidden_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_hidden_topics_user ON hidden_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_topics_topic ON hidden_topics(topic_id);

-- Reading history table (for bias tracking)
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article ON reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_read_at ON reading_history(read_at DESC);

-- RLS Policies for saved_topics
ALTER TABLE saved_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved topics"
  ON saved_topics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved topics"
  ON saved_topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved topics"
  ON saved_topics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hidden_topics
ALTER TABLE hidden_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hidden topics"
  ON hidden_topics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hidden topics"
  ON hidden_topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hidden topics"
  ON hidden_topics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reading_history
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading history"
  ON reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading history"
  ON reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading history"
  ON reading_history FOR DELETE
  USING (auth.uid() = user_id);


export type BiasLabel = "Left" | "Center" | "Right" | "Center-Left" | "Center-Right";
export type SideLabel = "Left" | "Center" | "Right";

export interface Source {
  id: string;
  name: string;
  home_url: string;
  rss_url: string;
  bias_label: BiasLabel;
  authority_score: number;
  country: string;
  language: string;
  active: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  source_id: string;
  url: string;
  canonical_url: string;
  title: string;
  summary: string;
  content_excerpt: string;
  published_at: string;
  lang: string;
  hash: string;
  embedding?: number[];
  created_at: string;
}

export interface Topic {
  id: string;
  title: string;
  first_seen_at: string;
  last_seen_at: string;
  cluster_hash: string;
}

export interface TopicMember {
  topic_id: string;
  article_id: string;
  side_label: SideLabel;
}

export interface BiasScore {
  article_id: string;
  leaning: SideLabel;
  score: number;
  confidence: number;
  explanation: string;
  created_at: string;
}

export interface RankSignal {
  article_id: string;
  recency: number;
  authority: number;
  coverage: number;
  engagement: number;
  geo: number;
  novelty: number;
  total_score: number;
  computed_at: string;
}

export interface UserRead {
  id: string;
  user_id: string;
  article_id: string;
  ts: string;
  dwell_ms?: number;
}

export interface Comment {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  created_at: string;
}

export interface Subscription {
  user_id: string;
  stripe_customer_id: string;
  plan: string;
  active: boolean;
  current_period_end: string;
}

export interface TopCluster {
  topic_id: string;
  title: string;
  last_seen_at: string;
  left_article_id?: string;
  center_article_id?: string;
  right_article_id?: string;
  importance_score: number;
}




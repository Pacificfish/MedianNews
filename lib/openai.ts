import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BiasClassification {
  leaning: "Left" | "Center" | "Right";
  score: number;
  confidence: number;
  explanation: string;
}

export interface CompareSummary {
  left_points: string[];
  center_points: string[];
  right_points: string[];
  neutral_recap: string;
}

export async function classifyBias(
  title: string,
  snippet: string,
  outletBiasHint?: string,
  fullTextExcerpt?: string
): Promise<BiasClassification> {
  const prompt = `You are a neutral media analyst. Analyze the following article and classify its political bias.

Title: ${title}
Snippet: ${snippet}
${outletBiasHint ? `Outlet bias hint: ${outletBiasHint}` : ""}
${fullTextExcerpt ? `Full text excerpt: ${fullTextExcerpt.substring(0, 1000)}` : ""}

Output strict JSON only:
{
  "leaning": "Left|Center|Right",
  "score": 0-100,
  "confidence": 0-100,
  "explanation": "1-2 sentence rationale"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a neutral media analyst. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as BiasClassification;
}

export async function generateCompareSummary(
  left: { title: string; snippet: string },
  center: { title: string; snippet: string },
  right: { title: string; snippet: string }
): Promise<CompareSummary> {
  const prompt = `You are a neutral summarizer. Compare how different sides frame the same story.

Left: ${left.title} - ${left.snippet}
Center: ${center.title} - ${center.snippet}
Right: ${right.title} - ${right.snippet}

Output strict JSON only:
{
  "left_points": ["...","...","..."],
  "center_points": ["...","...","..."],
  "right_points": ["...","...","..."],
  "neutral_recap": "2-3 sentences"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a neutral summarizer. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as CompareSummary;
}

/**
 * Generate a high-quality summary for an article
 */
export async function generateArticleSummary(
  title: string,
  content: string,
  maxLength: number = 200
): Promise<string> {
  const prompt = `You are a news editor. Write a concise, informative summary of the following article.

Title: ${title}
Content: ${content.substring(0, 2000)}

Requirements:
- Be objective and factual
- Highlight the key points and main story
- Write in clear, engaging prose
- Maximum ${maxLength} characters
- Do not include your opinion or analysis

Summary:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a professional news editor. Write concise, factual summaries.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: Math.ceil(maxLength / 3), // Rough estimate: 3 chars per token
  });

  const summary = response.choices[0]?.message?.content?.trim() || "";
  return summary.substring(0, maxLength);
}

/**
 * Estimate reading time in minutes based on word count
 */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

export interface PoliticalTopic {
  title: string;
  description: string;
  keywords: string[];
}

export async function discoverPoliticalTopics(): Promise<PoliticalTopic[]> {
  const prompt = `You are an expert news analyst. Identify the top 12 HOTTEST and MOST CURRENT political topics/news stories happening RIGHT NOW in the United States.

CRITICAL SELECTION CRITERIA - Prioritize topics that are:
1. BREAKING NEWS: Stories from the last 12-24 hours (not older than 48 hours)
2. HIGH IMPACT: Stories that affect many people, major policy changes, or significant events
3. MULTI-PERSPECTIVE: Stories that will have coverage from Left, Center, and Right-leaning sources
4. TRENDING: Stories currently trending on social media, news aggregators, or being actively discussed
5. NEWSWORTHY: Major political developments, policy announcements, court decisions, elections, scandals, etc.

AVOID:
- Generic ongoing issues without a specific recent development
- Stories older than 48 hours unless they have a major new development
- Topics that only one political side would cover
- Local-only stories (focus on national/international impact)

For each topic, provide:
- A clear, compelling title (max 100 characters) that captures the breaking news angle
- A detailed description (2-3 sentences) explaining:
  * What happened and when
  * Why it's significant/trending right now
  * Why it will have multi-perspective coverage
- 8-12 highly specific search keywords/phrases that would help find articles about this EXACT topic

CRITICAL KEYWORD REQUIREMENTS:
- Keywords must be SPECIFIC and UNIQUE to this topic
- Include proper nouns: full names of people, places, organizations, bills, laws, court cases
- Include specific policy terms, event names, legislation numbers, dates
- Include recent developments: "announces", "releases", "votes", "decides", "reports"
- Avoid generic words that could match unrelated articles
- Each keyword should be distinctive enough that articles matching 3+ keywords are almost certainly about this topic

Examples of EXCELLENT keywords:
- "Supreme Court abortion ruling", "Roe v Wade", "Dobbs decision", "reproductive rights", "Justice Alito"
- "Biden student loan forgiveness", "Education Department", "debt cancellation", "federal student loans"
- "January 6 committee report", "Capitol riot investigation", "Trump subpoena", "House select committee"

Examples of BAD keywords (too generic):
- "reform", "efforts", "policy", "government", "political", "legislation" (without context)
- "election", "vote", "campaign" (without specific context)

Output strict JSON only:
{
  "topics": [
    {
      "title": "Compelling, specific topic title",
      "description": "2-3 sentences explaining what happened, why it's significant, and why it's trending now",
      "keywords": ["specific", "keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"]
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a news analyst. Always respond with valid JSON only. Focus on the hottest, most current political stories.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7, // Balanced for diverse but focused topic discovery
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const parsed = JSON.parse(content);
    const topics = parsed.topics || [];
    
    if (topics.length === 0) {
      console.warn("WARNING: OpenAI returned 0 topics. Response:", content.substring(0, 500));
    }
    
    return topics;
  } catch (parseError: any) {
    console.error("Error parsing OpenAI response:", parseError);
    console.error("Response content:", content.substring(0, 1000));
    throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
  }
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small", // or "text-embedding-ada-002"
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

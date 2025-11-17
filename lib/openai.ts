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

export interface PoliticalTopic {
  title: string;
  description: string;
  keywords: string[];
}

export async function discoverPoliticalTopics(): Promise<PoliticalTopic[]> {
  const prompt = `You are a news analyst. Identify the top 10 HOTTEST and MOST CURRENT political topics/news stories happening RIGHT NOW in the United States.

IMPORTANT: Focus on topics that are:
- Breaking news from the last 24-48 hours
- Currently trending on social media or news aggregators
- Being actively discussed in political circles
- Likely to have coverage from multiple news outlets with different political perspectives (Left, Center, Right)

For each topic, provide:
- A clear, concise title (max 100 characters) that captures the current story
- A brief description (1-2 sentences) explaining why it's hot/current
- 7-10 highly specific search keywords/phrases that would help find articles about this EXACT topic

CRITICAL KEYWORD REQUIREMENTS:
- Keywords must be SPECIFIC and UNIQUE to this topic
- Include proper nouns: full names of people, places, organizations, bills, laws
- Include specific policy terms, event names, or legislation numbers
- Avoid generic words that could match unrelated articles (e.g., avoid "reform", "efforts", "policy" alone)
- Each keyword should be distinctive enough that articles matching 3+ keywords are almost certainly about this topic

Examples of GOOD keywords:
- "Affordable Care Act repeal", "Medicaid expansion", "health insurance premiums", "Joe Biden healthcare plan"
- "Border Security Act 2024", "immigration detention centers", "asylum seekers", "Texas border"
- "Federal Reserve interest rates", "inflation CPI", "Jerome Powell", "consumer price index"

Examples of BAD keywords (too generic):
- "reform", "efforts", "policy", "government", "political", "legislation" (without context)

Output strict JSON only:
{
  "topics": [
    {
      "title": "Topic title here",
      "description": "Brief description of why this is hot/current",
      "keywords": ["specific", "keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"]
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
    temperature: 0.8, // Slightly higher for more diverse/creative topic discovery
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content);
  return parsed.topics || [];
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

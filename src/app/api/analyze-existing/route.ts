import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const { video, accountAvg, totalVideos } = await req.json();

    const openai = getOpenAIClient();

    const engRate = video.view_count > 0
      ? ((video.like_count + video.comment_count + video.share_count) / video.view_count * 100).toFixed(1)
      : "0.0";

    const viewsVsAvg = accountAvg.views > 0
      ? ((video.view_count / accountAvg.views - 1) * 100).toFixed(0)
      : "0";

    const prompt = `Analyze this TikTok video's performance and explain WHY it performed the way it did.

VIDEO DATA:
- Description/Caption: "${video.video_description || video.title || "No caption"}"
- Views: ${video.view_count.toLocaleString()}
- Likes: ${video.like_count.toLocaleString()}
- Comments: ${video.comment_count.toLocaleString()}
- Shares: ${video.share_count.toLocaleString()}
- Duration: ${video.duration} seconds
- Engagement Rate: ${engRate}%
- Performance vs Average: ${viewsVsAvg}% ${parseInt(viewsVsAvg) >= 0 ? "above" : "below"} average

ACCOUNT CONTEXT:
- Average views per video: ${Math.round(accountAvg.views).toLocaleString()}
- Average likes per video: ${Math.round(accountAvg.likes).toLocaleString()}
- Total videos: ${totalVideos}

Analyze the caption, hashtags, topic, length, and engagement patterns. Respond ONLY with valid JSON:
{
  "overallScore": <0-100 based on performance relative to account average>,
  "verdict": "<one sentence summary of how this video performed>",
  "whyItWorked": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "whyItDidnt": ["<area for improvement 1>", "<area 2>", "<area 3>"],
  "breakdown": [
    { "category": "Topic/Concept", "score": <0-100>, "insight": "<specific insight>" },
    { "category": "Caption & Hashtags", "score": <0-100>, "insight": "<specific insight>" },
    { "category": "Video Length", "score": <0-100>, "insight": "<specific insight>" },
    { "category": "Engagement Drivers", "score": <0-100>, "insight": "<specific insight>" },
    { "category": "Shareability", "score": <0-100>, "insight": "<specific insight>" }
  ],
  "suggestions": ["<actionable suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>"],
  "comparisonToAvg": {
    "views": "<how views compare to avg>",
    "engagement": "<how engagement compares>",
    "summary": "<2-3 sentence comparison to their typical performance>"
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert TikTok analytics consultant. Analyze video performance data and provide specific, actionable insights. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No response from AI" }, { status: 500 });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Invalid response format" }, { status: 500 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err: unknown) {
    console.error("Existing video analysis error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

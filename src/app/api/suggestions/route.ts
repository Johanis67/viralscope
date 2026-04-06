import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, SYSTEM_PROMPT_IDEAS } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key not configured. Add OPENAI_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const { followers, displayName, bio, videoCount, topVideos, customPrompt } =
      await req.json();

    const openai = getOpenAIClient();

    let videoDataSection = "No video data available.";
    if (topVideos && topVideos.length > 0) {
      const videoLines = topVideos
        .map(
          (v: {
            description: string;
            views: number;
            likes: number;
            comments: number;
            shares: number;
            duration: number;
          }, i: number) =>
            `${i + 1}. "${v.description}" — ${v.views.toLocaleString()} views, ${v.likes.toLocaleString()} likes, ${v.comments.toLocaleString()} comments, ${v.shares.toLocaleString()} shares, ${v.duration}s`
        )
        .join("\n");

      videoDataSection = `Top ${topVideos.length} videos by views:\n${videoLines}`;
    }

    const userMessage = `Generate 6 viral TikTok content ideas for this creator:

CREATOR PROFILE:
- Name: ${displayName || "Unknown"}
- Bio: ${bio || "Not provided"}
- Followers: ${followers?.toLocaleString() || "Unknown"}
- Total videos: ${videoCount || "Unknown"}

REAL VIDEO PERFORMANCE DATA:
${videoDataSection}

ADDITIONAL REQUEST: ${customPrompt || "None"}

Analyze their best performing content to find patterns (topics, styles, lengths, hooks that work). Generate:
- 2 ideas that double down on their proven content patterns (mark as "past-performance")
- 2 ideas adapting current TikTok trends to their style (mark as "trending")
- 2 ideas exploring untapped opportunities in their space (mark as "niche-analysis")

Base your predictions on their ACTUAL view counts. If their top video gets 50K views, don't predict 10M — be realistic relative to their account size.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_IDEAS },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4000,
      temperature: 0.9,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Suggestions error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, SYSTEM_PROMPT_ANALYZE } from "@/lib/openai";

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

    const { frames, metadata, accountContext, suggestCaption, suggestHashtags } = await req.json();

    if (!frames || frames.length === 0) {
      return NextResponse.json(
        { error: "No video frames provided" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    const imageMessages = frames.map((frame: string) => ({
      type: "image_url" as const,
      image_url: { url: frame, detail: "low" as const },
    }));

    let contextSection = "";
    if (accountContext) {
      contextSection = `
CREATOR'S ACCOUNT CONTEXT (use this to calibrate predictions):
- Average views per video: ${accountContext.avgViews?.toLocaleString() || "Unknown"}
- Total videos posted: ${accountContext.totalVideos || "Unknown"}
- Best video views: ${accountContext.topVideoViews?.toLocaleString() || "Unknown"}

Predict view counts RELATIVE to their actual account performance, not generic numbers.`;
    }

    let suggestSection = "";
    if (suggestCaption || suggestHashtags) {
      suggestSection = `\n\nADDITIONAL REQUESTS:`;
      if (suggestCaption) suggestSection += `\n- The creator hasn't decided on a caption yet. In your tips, include 2-3 specific caption suggestions that would maximize engagement for this video. Make them punchy and scroll-stopping.`;
      if (suggestHashtags) suggestSection += `\n- The creator needs hashtag recommendations. In your tips, include a set of 8-12 recommended hashtags (mix of broad reach tags like #fyp and niche-specific tags for their content).`;
    }

    const userMessage = `Analyze this TikTok video for virality potential. Here are ${frames.length} frames from the video.

Video metadata:
- Caption: ${metadata.caption || "Not provided"}
- Hashtags: ${metadata.hashtags || "Not provided"}
- Niche: ${metadata.niche || "Not specified"}
- Target Audience: ${metadata.targetAudience || "Not specified"}
- Planned Posting Time: ${metadata.postingTime || "Not specified"}
${contextSection}${suggestSection}

Provide a comprehensive virality analysis with:
1. An overall virality score (0-100)
2. Detailed breakdown of each factor
3. Specific, actionable improvement tips
4. Key virality factors (positive and negative)
5. Predicted view ranges (low/mid/high) calibrated to this creator's account`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_ANALYZE },
        {
          role: "user",
          content: [{ type: "text", text: userMessage }, ...imageMessages],
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
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
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

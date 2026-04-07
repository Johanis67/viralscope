import { NextRequest, NextResponse } from "next/server";
import { fetchAllVideos } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.EXTERNAL_API_KEY;

  if (!expectedKey || !authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "No TikTok token stored. Log in through the web UI first." },
      { status: 401 }
    );
  }

  try {
    const videos = await fetchAllVideos(token);
    return NextResponse.json({ videos });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

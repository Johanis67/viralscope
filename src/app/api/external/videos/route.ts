import { NextRequest, NextResponse } from "next/server";
import { fetchAllVideos } from "@/lib/tiktok";
import { readFile } from "fs/promises";

async function getStoredToken(): Promise<string | null> {
  if (process.env.TIKTOK_ACCESS_TOKEN) return process.env.TIKTOK_ACCESS_TOKEN;
  try {
    const token = await readFile("/tmp/tiktok_token.txt", "utf-8");
    return token.trim() || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.EXTERNAL_API_KEY;

  if (!expectedKey || !authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getStoredToken();
  if (!token) {
    return NextResponse.json(
      { error: "No TikTok token. User needs to log in at the web UI first." },
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

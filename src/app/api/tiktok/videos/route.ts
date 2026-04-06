import { NextRequest, NextResponse } from "next/server";
import { fetchAllVideos } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tiktok_access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const videos = await fetchAllVideos(token);
    return NextResponse.json({ videos });
  } catch (err) {
    console.error("Videos fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { fetchUserProfile, fetchAllVideos } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tiktok_access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated. Log in first." }, { status: 401 });
  }

  try {
    const [user, videos] = await Promise.all([
      fetchUserProfile(token),
      fetchAllVideos(token),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      profile: user,
      videos: videos.map((v: Record<string, unknown>) => ({
        id: v.id,
        description: v.video_description || v.title || "",
        views: v.view_count,
        likes: v.like_count,
        comments: v.comment_count,
        shares: v.share_count,
        duration: v.duration,
        date: new Date((v.create_time as number) * 1000).toISOString(),
        url: v.share_url,
      })),
    };

    return NextResponse.json(data, {
      headers: {
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}

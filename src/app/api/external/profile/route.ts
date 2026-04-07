import { NextRequest, NextResponse } from "next/server";
import { fetchUserProfile } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.EXTERNAL_API_KEY;

  if (!expectedKey || !authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "No TikTok token stored. Log in through the web UI first, then copy the token." },
      { status: 401 }
    );
  }

  try {
    const user = await fetchUserProfile(token);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

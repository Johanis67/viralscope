import { NextRequest, NextResponse } from "next/server";
import { fetchUserProfile } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tiktok_access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await fetchUserProfile(token);
    return NextResponse.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { generatePKCE, generateState, getAuthorizationUrl } from "@/lib/tiktok";

export async function GET() {
  if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "TikTok credentials not configured" },
      { status: 500 }
    );
  }

  const { verifier, challenge } = generatePKCE();
  const state = generateState();
  const authUrl = getAuthorizationUrl(challenge, state);

  const response = NextResponse.redirect(authUrl);

  response.cookies.set("tiktok_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  response.cookies.set("tiktok_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}

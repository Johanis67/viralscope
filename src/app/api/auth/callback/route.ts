import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_params`);
  }

  const savedState = req.cookies.get("tiktok_state")?.value;
  const codeVerifier = req.cookies.get("tiktok_verifier")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${baseUrl}/?error=invalid_state`);
  }

  if (!codeVerifier) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_verifier`);
  }

  try {
    const tokenData = await exchangeCodeForToken(code, codeVerifier);

    const response = NextResponse.redirect(`${baseUrl}/dashboard`);

    response.cookies.set("tiktok_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in,
      path: "/",
    });

    if (tokenData.refresh_token) {
      response.cookies.set("tiktok_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    response.cookies.set("tiktok_open_id", tokenData.open_id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in,
      path: "/",
    });

    // Mark as connected (readable by client)
    response.cookies.set("tiktok_connected", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in,
      path: "/",
    });

    // Cleanup OAuth cookies
    response.cookies.delete("tiktok_state");
    response.cookies.delete("tiktok_verifier");

    return response;
  } catch (err) {
    console.error("Token exchange error:", err);
    const msg =
      err instanceof Error ? err.message : "Token exchange failed";
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(msg)}`
    );
  }
}

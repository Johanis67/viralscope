import { NextResponse } from "next/server";

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = NextResponse.redirect(baseUrl);

  response.cookies.delete("tiktok_access_token");
  response.cookies.delete("tiktok_refresh_token");
  response.cookies.delete("tiktok_open_id");
  response.cookies.delete("tiktok_connected");

  return response;
}

export async function GET() {
  return POST();
}

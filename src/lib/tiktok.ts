import crypto from "crypto";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_URL = "https://open.tiktokapis.com/v2/user/info/";
const TIKTOK_VIDEO_URL = "https://open.tiktokapis.com/v2/video/list/";

const SCOPES = "user.info.basic,user.info.profile,user.info.stats,video.list";

function base64url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePKCE() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

export function generateState(): string {
  return base64url(crypto.randomBytes(16));
}

export function getAuthorizationUrl(
  codeChallenge: string,
  state: string
): string {
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  refresh_token: string;
  open_id: string;
  expires_in: number;
}> {
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data;
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data;
}

const USER_FIELDS = [
  "open_id",
  "union_id",
  "avatar_url",
  "display_name",
  "bio_description",
  "profile_deep_link",
  "is_verified",
  "follower_count",
  "following_count",
  "likes_count",
  "video_count",
].join(",");

export async function fetchUserProfile(accessToken: string) {
  const url = `${TIKTOK_USER_URL}?fields=${USER_FIELDS}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (data.error?.code !== "ok" && data.error?.code) {
    throw new Error(data.error.message || "Failed to fetch profile");
  }
  return data.data.user;
}

const VIDEO_FIELDS = [
  "id",
  "title",
  "video_description",
  "duration",
  "cover_image_url",
  "share_url",
  "create_time",
  "like_count",
  "comment_count",
  "share_count",
  "view_count",
].join(",");

export async function fetchUserVideos(
  accessToken: string,
  cursor: number = 0,
  maxCount: number = 20
) {
  const url = `${TIKTOK_VIDEO_URL}?fields=${VIDEO_FIELDS}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_count: maxCount, cursor }),
  });
  const data = await res.json();
  if (data.error?.code !== "ok" && data.error?.code) {
    throw new Error(data.error.message || "Failed to fetch videos");
  }
  return data.data;
}

export async function fetchAllVideos(accessToken: string) {
  const allVideos = [];
  let cursor = 0;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchUserVideos(accessToken, cursor);
    if (data.videos) {
      allVideos.push(...data.videos);
    }
    hasMore = data.has_more;
    cursor = data.cursor;
    if (allVideos.length >= 100) break;
  }

  return allVideos;
}

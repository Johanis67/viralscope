"use client";

import { useState, useEffect } from "react";
import { Key, User, RefreshCw, LogOut, Shield, ExternalLink } from "lucide-react";
import { TikTokUser } from "@/types";
import { formatNumber } from "@/lib/utils";

export default function SettingsPage() {
  const [user, setUser] = useState<TikTokUser | null>(null);

  useEffect(() => {
    fetch("/api/tiktok/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Connected Account */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tiktok-pink/10">
            <User className="h-5 w-5 text-tiktok-pink" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Connected Account
            </h3>
            <p className="text-xs text-text-muted">
              Your linked TikTok account
            </p>
          </div>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-surface-2 p-4 border border-border">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tiktok-pink/20 text-xl font-bold text-tiktok-pink">
                  {user.display_name?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="text-base font-bold text-text-primary">
                  {user.display_name}
                </p>
                {user.bio_description && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {user.bio_description}
                  </p>
                )}
                <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                  <span>
                    <strong className="text-text-primary">
                      {formatNumber(user.follower_count)}
                    </strong>{" "}
                    followers
                  </span>
                  <span>
                    <strong className="text-text-primary">
                      {formatNumber(user.following_count)}
                    </strong>{" "}
                    following
                  </span>
                  <span>
                    <strong className="text-text-primary">
                      {formatNumber(user.likes_count)}
                    </strong>{" "}
                    likes
                  </span>
                </div>
              </div>
            </div>

            {user.profile_deep_link && (
              <a
                href={user.profile_deep_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                View on TikTok
              </a>
            )}

            <div className="flex gap-3 pt-2 border-t border-border">
              <a
                href="/api/auth/logout"
                className="btn-secondary inline-flex items-center gap-2 text-sm text-tiktok-pink"
              >
                <LogOut className="h-4 w-4" />
                Disconnect Account
              </a>
              <a
                href="/api/auth/tiktok"
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Reconnect
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">Loading account info...</p>
          </div>
        )}
      </div>

      {/* API Key */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tiktok-purple/10">
            <Key className="h-5 w-5 text-tiktok-purple" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              OpenAI API Key
            </h3>
            <p className="text-xs text-text-muted">
              For AI video analysis and content suggestions
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-3">
          Add your API key to{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-tiktok-cyan">
            .env.local
          </code>{" "}
          in the project root:
        </p>

        <div className="rounded-xl bg-surface-2 p-4 border border-border font-mono text-sm text-text-secondary">
          OPENAI_API_KEY=sk-your-key-here
        </div>

        <p className="mt-3 text-xs text-text-muted">
          Get your key from{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tiktok-cyan hover:underline"
          >
            platform.openai.com/api-keys
          </a>
        </p>
      </div>

      {/* Permissions */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-viral-green/10">
            <Shield className="h-5 w-5 text-viral-green" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Permissions</h3>
            <p className="text-xs text-text-muted">What we access</p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            {
              scope: "user.info.basic",
              desc: "Display name and avatar",
            },
            {
              scope: "user.info.profile",
              desc: "Bio and profile link",
            },
            {
              scope: "user.info.stats",
              desc: "Follower count, likes, video count",
            },
            {
              scope: "video.list",
              desc: "Your videos with view/like/comment/share counts",
            },
          ].map((p) => (
            <div
              key={p.scope}
              className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2"
            >
              <span className="text-xs font-mono text-tiktok-cyan">
                {p.scope}
              </span>
              <span className="text-xs text-text-muted">{p.desc}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-text-muted">
          We never post, comment, or modify anything on your account. Read-only
          access.
        </p>
      </div>
    </div>
  );
}

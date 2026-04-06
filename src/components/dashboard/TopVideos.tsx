"use client";

import { Eye, Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { TikTokVideo } from "@/types";

interface TopVideosProps {
  videos: TikTokVideo[];
}

export default function TopVideos({ videos }: TopVideosProps) {
  const sorted = [...videos].sort((a, b) => b.view_count - a.view_count);

  if (sorted.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold text-text-primary">Top Videos</h3>
        <p className="text-sm text-text-muted mb-4">By view count</p>
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <Eye className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">No videos found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-text-primary">Top Videos</h3>
      <p className="text-sm text-text-muted mb-4">Your best performers</p>

      <div className="space-y-3">
        {sorted.slice(0, 5).map((video, i) => {
          const engRate =
            video.view_count > 0
              ? (
                  ((video.like_count +
                    video.comment_count +
                    video.share_count) /
                    video.view_count) *
                  100
                ).toFixed(1)
              : "0.0";

          return (
            <div
              key={video.id}
              className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 transition-colors hover:bg-surface-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tiktok-pink/10 text-sm font-bold text-tiktok-pink">
                #{i + 1}
              </div>

              {video.cover_image_url && (
                <img
                  src={video.cover_image_url}
                  alt=""
                  className="h-12 w-9 shrink-0 rounded-lg object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {video.video_description || video.title || "Untitled"}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                  <span>
                    {new Date(video.create_time * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(video.view_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatNumber(video.like_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {formatNumber(video.comment_count)}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-tiktok-cyan">
                  {engRate}%
                </p>
                <p className="text-[10px] text-text-muted">eng. rate</p>
              </div>

              {video.share_url && (
                <a
                  href={video.share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-text-muted hover:text-tiktok-cyan transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

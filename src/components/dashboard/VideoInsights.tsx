"use client";

import { TikTokVideo } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Clock, Flame, TrendingDown, BarChart3 } from "lucide-react";

interface VideoInsightsProps {
  videos: TikTokVideo[];
}

export default function VideoInsights({ videos }: VideoInsightsProps) {
  if (videos.length === 0) return null;

  const totalViews = videos.reduce((s, v) => s + v.view_count, 0);
  const totalLikes = videos.reduce((s, v) => s + v.like_count, 0);
  const totalComments = videos.reduce((s, v) => s + v.comment_count, 0);
  const totalShares = videos.reduce((s, v) => s + v.share_count, 0);

  const avgEngRate =
    totalViews > 0
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100
      : 0;

  const avgDuration =
    videos.reduce((s, v) => s + v.duration, 0) / videos.length;

  const best = [...videos].sort((a, b) => b.view_count - a.view_count)[0];
  const worst = [...videos].sort((a, b) => a.view_count - b.view_count)[0];

  const insights = [
    {
      icon: BarChart3,
      label: "Avg Engagement Rate",
      value: `${avgEngRate.toFixed(1)}%`,
      color: "text-tiktok-cyan",
      bg: "bg-tiktok-cyan/10",
    },
    {
      icon: Clock,
      label: "Avg Video Duration",
      value: `${Math.round(avgDuration)}s`,
      color: "text-tiktok-purple",
      bg: "bg-tiktok-purple/10",
    },
    {
      icon: Flame,
      label: "Best Video Views",
      value: formatNumber(best.view_count),
      color: "text-tiktok-pink",
      bg: "bg-tiktok-pink/10",
      sub: (best.video_description || best.title || "").slice(0, 40),
    },
    {
      icon: TrendingDown,
      label: "Lowest Video Views",
      value: formatNumber(worst.view_count),
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      sub: (worst.video_description || worst.title || "").slice(0, 40),
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-text-primary mb-4">
        Quick Insights
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {insights.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl bg-surface-2 p-3"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
            >
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{item.label}</p>
              <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
              {item.sub && (
                <p className="truncate text-[10px] text-text-muted">
                  {item.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

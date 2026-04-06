"use client";

import { TikTokUser, TikTokVideo } from "@/types";
import { getViralityColor } from "@/lib/utils";
import { Activity } from "lucide-react";

interface AccountHealthProps {
  user: TikTokUser;
  videos: TikTokVideo[];
}

interface HealthMetric {
  label: string;
  score: number;
  detail: string;
}

export default function AccountHealth({ user, videos }: AccountHealthProps) {
  if (videos.length < 2) return null;

  const totalViews = videos.reduce((s, v) => s + v.view_count, 0);
  const totalLikes = videos.reduce((s, v) => s + v.like_count, 0);
  const totalComments = videos.reduce((s, v) => s + v.comment_count, 0);
  const totalShares = videos.reduce((s, v) => s + v.share_count, 0);
  const avgViews = totalViews / videos.length;

  const engRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0;

  // Reach: avg views relative to follower count (TikTok pushes to non-followers via FYP)
  const viewToFollowerRatio = user.follower_count > 0 ? avgViews / user.follower_count : 0;
  const reachRate = viewToFollowerRatio * 100;

  // Consistency: std deviation of views (lower = more consistent)
  const viewValues = videos.map((v) => v.view_count);
  const mean = avgViews;
  const variance = viewValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / viewValues.length;
  const stdDev = Math.sqrt(variance);
  const coeffOfVariation = mean > 0 ? (stdDev / mean) : 0;

  // Recent momentum: are recent videos doing better than older ones?
  const sorted = [...videos].sort((a, b) => b.create_time - a.create_time);
  const recentHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
  const olderHalf = sorted.slice(Math.ceil(sorted.length / 2));
  const recentAvg = recentHalf.reduce((s, v) => s + v.view_count, 0) / recentHalf.length;
  const olderAvg = olderHalf.length > 0 ? olderHalf.reduce((s, v) => s + v.view_count, 0) / olderHalf.length : recentAvg;
  const momentum = olderAvg > 0 ? ((recentAvg / olderAvg - 1) * 100) : 0;

  const metrics: HealthMetric[] = [
    {
      label: "Engagement",
      score: Math.min(100, engRate >= 10 ? 95 : engRate >= 7 ? 85 : engRate >= 4 ? 70 : engRate >= 2 ? 50 : Math.round(engRate * 25)),
      detail: engRate >= 7
        ? `${engRate.toFixed(1)}% — excellent for TikTok`
        : engRate >= 4
          ? `${engRate.toFixed(1)}% — solid engagement`
          : `${engRate.toFixed(1)}% engagement rate`,
    },
    {
      label: "Reach",
      score: Math.min(100, viewToFollowerRatio >= 1 ? 95 : viewToFollowerRatio >= 0.5 ? 80 : viewToFollowerRatio >= 0.2 ? 60 : viewToFollowerRatio >= 0.1 ? 40 : Math.round(viewToFollowerRatio * 400)),
      detail: viewToFollowerRatio >= 1
        ? `${reachRate.toFixed(0)}% — views exceed followers (FYP is pushing you)`
        : viewToFollowerRatio >= 0.3
          ? `${reachRate.toFixed(0)}% — good reach, content reaching beyond followers`
          : `${reachRate.toFixed(0)}% — avg views vs follower count`,
    },
    {
      label: "Consistency",
      score: Math.min(100, Math.max(0, Math.round(100 - coeffOfVariation * 40))),
      detail: coeffOfVariation < 1 ? "Fairly consistent performance" : "High variance between videos",
    },
    {
      label: "Momentum",
      score: Math.min(100, Math.max(0, Math.round(50 + momentum / 2))),
      detail: momentum > 0 ? `Recent videos ${Math.round(momentum)}% above older avg` : `Recent videos ${Math.round(Math.abs(momentum))}% below older avg`,
    },
  ];

  const overall = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);
  const overallColor = getViralityColor(overall);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-tiktok-cyan" />
        <h3 className="text-lg font-bold text-text-primary">Account Health</h3>
      </div>

      <div className="flex items-center gap-6 mb-6">
        {/* Overall score ring */}
        <div className="relative h-28 w-28 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a4a" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={overallColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 * (1 - overall / 100)}
              style={{ filter: `drop-shadow(0 0 6px ${overallColor}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color: overallColor }}>{overall}</span>
            <span className="text-[10px] text-text-muted">/100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {metrics.map((m) => {
            const color = getViralityColor(m.score);
            return (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-primary">{m.label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{m.score}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: color }} />
                </div>
                <p className="mt-0.5 text-[10px] text-text-muted">{m.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

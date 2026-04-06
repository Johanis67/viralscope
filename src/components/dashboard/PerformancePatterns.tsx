"use client";

import { TikTokVideo } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Clock, Calendar, Hash, Film, TrendingUp } from "lucide-react";

interface PerformancePatternsProps {
  videos: TikTokVideo[];
}

export default function PerformancePatterns({ videos }: PerformancePatternsProps) {
  if (videos.length < 3) return null;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayStats: Record<number, { total: number; count: number }> = {};
  const hourStats: Record<number, { total: number; count: number }> = {};
  const lengthBuckets: Record<string, { total: number; count: number }> = {
    "0-15s": { total: 0, count: 0 },
    "15-30s": { total: 0, count: 0 },
    "30-60s": { total: 0, count: 0 },
    "60s+": { total: 0, count: 0 },
  };

  const hashtagPerf: Record<string, { views: number; count: number }> = {};

  for (const v of videos) {
    const d = new Date(v.create_time * 1000);
    const day = d.getDay();
    const hour = d.getHours();

    dayStats[day] = dayStats[day] || { total: 0, count: 0 };
    dayStats[day].total += v.view_count;
    dayStats[day].count++;

    hourStats[hour] = hourStats[hour] || { total: 0, count: 0 };
    hourStats[hour].total += v.view_count;
    hourStats[hour].count++;

    const dur = v.duration;
    const bucket = dur <= 15 ? "0-15s" : dur <= 30 ? "15-30s" : dur <= 60 ? "30-60s" : "60s+";
    lengthBuckets[bucket].total += v.view_count;
    lengthBuckets[bucket].count++;

    const tags = (v.video_description || "").match(/#\w+/g);
    if (tags) {
      for (const tag of tags) {
        const t = tag.toLowerCase();
        hashtagPerf[t] = hashtagPerf[t] || { views: 0, count: 0 };
        hashtagPerf[t].views += v.view_count;
        hashtagPerf[t].count++;
      }
    }
  }

  const bestDay = Object.entries(dayStats)
    .map(([d, s]) => ({ day: dayNames[parseInt(d)], avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  const bestHours = Object.entries(hourStats)
    .map(([h, s]) => ({ hour: parseInt(h), avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);

  const bestLength = Object.entries(lengthBuckets)
    .filter(([, s]) => s.count > 0)
    .map(([bucket, s]) => ({ bucket, avg: s.total / s.count, count: s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  const topHashtags = Object.entries(hashtagPerf)
    .filter(([, s]) => s.count >= 2)
    .map(([tag, s]) => ({ tag, avgViews: s.views / s.count, count: s.count }))
    .sort((a, b) => b.avgViews - a.avgViews)
    .slice(0, 5);

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}${ampm}`;
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-tiktok-pink" />
        <h3 className="text-lg font-bold text-text-primary">Performance Patterns</h3>
      </div>
      <p className="text-sm text-text-muted mb-4">What the data says about your best content</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Best Day */}
        {bestDay && (
          <div className="rounded-xl bg-surface-2 p-4 border border-border">
            <Calendar className="h-5 w-5 text-tiktok-cyan mb-2" />
            <p className="text-xs text-text-muted">Best Day to Post</p>
            <p className="text-xl font-bold text-text-primary">{bestDay.day}</p>
            <p className="text-xs text-text-muted">
              Avg {formatNumber(Math.round(bestDay.avg))} views
            </p>
          </div>
        )}

        {/* Best Times */}
        <div className="rounded-xl bg-surface-2 p-4 border border-border">
          <Clock className="h-5 w-5 text-tiktok-purple mb-2" />
          <p className="text-xs text-text-muted">Best Times</p>
          <p className="text-xl font-bold text-text-primary">
            {bestHours.map((h) => formatHour(h.hour)).join(", ")}
          </p>
          <p className="text-xs text-text-muted">Highest avg views</p>
        </div>

        {/* Best Length */}
        {bestLength && (
          <div className="rounded-xl bg-surface-2 p-4 border border-border">
            <Film className="h-5 w-5 text-viral-green mb-2" />
            <p className="text-xs text-text-muted">Optimal Length</p>
            <p className="text-xl font-bold text-text-primary">{bestLength.bucket}</p>
            <p className="text-xs text-text-muted">
              Avg {formatNumber(Math.round(bestLength.avg))} views ({bestLength.count} videos)
            </p>
          </div>
        )}

        {/* Top Hashtag */}
        {topHashtags.length > 0 && (
          <div className="rounded-xl bg-surface-2 p-4 border border-border">
            <Hash className="h-5 w-5 text-tiktok-pink mb-2" />
            <p className="text-xs text-text-muted">Best Hashtag</p>
            <p className="text-xl font-bold text-text-primary truncate">{topHashtags[0].tag}</p>
            <p className="text-xs text-text-muted">
              Avg {formatNumber(Math.round(topHashtags[0].avgViews))} views
            </p>
          </div>
        )}
      </div>

      {/* Top Hashtags Table */}
      {topHashtags.length > 1 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-text-secondary mb-2">Top Performing Hashtags (used 2+ times)</p>
          <div className="space-y-1.5">
            {topHashtags.map((h) => (
              <div key={h.tag} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                <span className="text-sm font-medium text-tiktok-cyan">{h.tag}</span>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{h.count} videos</span>
                  <span className="font-semibold text-text-primary">{formatNumber(Math.round(h.avgViews))} avg views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

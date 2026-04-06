"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TikTokVideo } from "@/types";
import { formatNumber } from "@/lib/utils";
import {
  Loader2,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowUpDown,
  Search,
  ExternalLink,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react";

type SortKey = "view_count" | "like_count" | "comment_count" | "share_count" | "create_time" | "engagement";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "view_count", label: "Views" },
  { key: "like_count", label: "Likes" },
  { key: "comment_count", label: "Comments" },
  { key: "share_count", label: "Shares" },
  { key: "engagement", label: "Engagement %" },
  { key: "create_time", label: "Date" },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("view_count");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/tiktok/videos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.videos) setVideos(data.videos);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let vids = [...videos];
    if (search) {
      const q = search.toLowerCase();
      vids = vids.filter(
        (v) =>
          (v.video_description || "").toLowerCase().includes(q) ||
          (v.title || "").toLowerCase().includes(q)
      );
    }

    vids.sort((a, b) => {
      let aVal: number, bVal: number;
      if (sortBy === "engagement") {
        aVal = a.view_count > 0 ? (a.like_count + a.comment_count + a.share_count) / a.view_count : 0;
        bVal = b.view_count > 0 ? (b.like_count + b.comment_count + b.share_count) / b.view_count : 0;
      } else {
        aVal = a[sortBy];
        bVal = b[sortBy];
      }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return vids;
  }, [videos, sortBy, sortDir, search]);

  const avgViews = videos.length > 0 ? videos.reduce((s, v) => s + v.view_count, 0) / videos.length : 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-tiktok-pink" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 !pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Sort by:</span>
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                if (sortBy === opt.key) {
                  setSortDir((d) => (d === "desc" ? "asc" : "desc"));
                } else {
                  setSortBy(opt.key);
                  setSortDir("desc");
                }
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                sortBy === opt.key
                  ? "bg-tiktok-pink/15 text-tiktok-pink border-tiktok-pink/30"
                  : "bg-surface text-text-secondary border-border hover:bg-surface-2"
              }`}
            >
              {opt.label}
              {sortBy === opt.key && (
                <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((video) => {
          const engRate =
            video.view_count > 0
              ? ((video.like_count + video.comment_count + video.share_count) / video.view_count * 100).toFixed(1)
              : "0.0";
          const isAboveAvg = video.view_count > avgViews;
          const date = new Date(video.create_time * 1000);

          return (
            <Link
              key={video.id}
              href={`/videos/${video.id}`}
              className="card group cursor-pointer hover:border-tiktok-pink/30 transition-all"
            >
              <div className="flex gap-3">
                {video.cover_image_url && (
                  <img
                    src={video.cover_image_url}
                    alt=""
                    className="h-24 w-[68px] shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-text-primary leading-snug">
                    {video.video_description || video.title || "Untitled"}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}s
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    {isAboveAvg ? (
                      <span className="rounded-md bg-viral-green/10 px-1.5 py-0.5 text-[10px] font-bold text-viral-green">
                        ABOVE AVG
                      </span>
                    ) : (
                      <span className="rounded-md bg-tiktok-pink/10 px-1.5 py-0.5 text-[10px] font-bold text-tiktok-pink">
                        BELOW AVG
                      </span>
                    )}
                    <span className="rounded-md bg-tiktok-purple/10 px-1.5 py-0.5 text-[10px] font-bold text-tiktok-purple">
                      {engRate}% ENG
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-surface-2 p-2.5">
                <div className="text-center">
                  <Eye className="mx-auto h-3 w-3 text-tiktok-pink mb-0.5" />
                  <p className="text-xs font-bold text-text-primary">{formatNumber(video.view_count)}</p>
                </div>
                <div className="text-center">
                  <Heart className="mx-auto h-3 w-3 text-tiktok-cyan mb-0.5" />
                  <p className="text-xs font-bold text-text-primary">{formatNumber(video.like_count)}</p>
                </div>
                <div className="text-center">
                  <MessageCircle className="mx-auto h-3 w-3 text-tiktok-purple mb-0.5" />
                  <p className="text-xs font-bold text-text-primary">{formatNumber(video.comment_count)}</p>
                </div>
                <div className="text-center">
                  <Share2 className="mx-auto h-3 w-3 text-viral-green mb-0.5" />
                  <p className="text-xs font-bold text-text-primary">{formatNumber(video.share_count)}</p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-text-muted group-hover:text-tiktok-pink transition-colors flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Click for AI deep dive
                </span>
                {video.share_url && (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(video.share_url, "_blank");
                    }}
                    className="text-text-muted hover:text-tiktok-cyan transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card py-16 text-center">
          <p className="text-text-muted">No videos found</p>
        </div>
      )}
    </div>
  );
}

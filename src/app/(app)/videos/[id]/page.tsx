"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TikTokVideo } from "@/types";
import { formatNumber, getViralityColor } from "@/lib/utils";
import {
  Loader2,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface VideoAnalysis {
  overallScore: number;
  verdict: string;
  whyItWorked: string[];
  whyItDidnt: string[];
  breakdown: {
    category: string;
    score: number;
    insight: string;
  }[];
  suggestions: string[];
  comparisonToAvg: {
    views: string;
    engagement: string;
    summary: string;
  };
}

export default function VideoDeepDivePage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<TikTokVideo | null>(null);
  const [allVideos, setAllVideos] = useState<TikTokVideo[]>([]);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tiktok/videos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.videos) {
          setAllVideos(data.videos);
          const found = data.videos.find((v: TikTokVideo) => v.id === videoId);
          setVideo(found || null);
        }
      })
      .finally(() => setLoading(false));
  }, [videoId]);

  async function runAnalysis() {
    if (!video) return;
    setAnalyzing(true);
    setError(null);

    try {
      const avgViews = allVideos.reduce((s, v) => s + v.view_count, 0) / allVideos.length;
      const avgLikes = allVideos.reduce((s, v) => s + v.like_count, 0) / allVideos.length;
      const avgComments = allVideos.reduce((s, v) => s + v.comment_count, 0) / allVideos.length;

      const res = await fetch("/api/analyze-existing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video,
          accountAvg: { views: avgViews, likes: avgLikes, comments: avgComments },
          totalVideos: allVideos.length,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Analysis failed");
      const data = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-tiktok-pink" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="card py-16 text-center">
        <p className="text-text-muted">Video not found</p>
        <Link href="/videos" className="btn-primary mt-4 inline-block">
          Back to Videos
        </Link>
      </div>
    );
  }

  const avgViews = allVideos.length > 0 ? allVideos.reduce((s, v) => s + v.view_count, 0) / allVideos.length : 0;
  const engRate = video.view_count > 0
    ? ((video.like_count + video.comment_count + video.share_count) / video.view_count * 100).toFixed(1)
    : "0.0";
  const viewsVsAvg = avgViews > 0 ? ((video.view_count / avgViews - 1) * 100).toFixed(0) : "0";
  const isAboveAvg = video.view_count > avgViews;

  return (
    <div className="space-y-6">
      <Link href="/videos" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        All Videos
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Video info */}
        <div className="space-y-4">
          <div className="card">
            {video.cover_image_url && (
              <img src={video.cover_image_url} alt="" className="w-full rounded-xl object-cover mb-4 max-h-80" />
            )}

            <p className="text-sm font-medium text-text-primary leading-relaxed">
              {video.video_description || video.title || "Untitled"}
            </p>

            <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(video.create_time * 1000).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {video.duration}s
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: Eye, label: "Views", val: video.view_count, color: "text-tiktok-pink" },
                { icon: Heart, label: "Likes", val: video.like_count, color: "text-tiktok-cyan" },
                { icon: MessageCircle, label: "Comments", val: video.comment_count, color: "text-tiktok-purple" },
                { icon: Share2, label: "Shares", val: video.share_count, color: "text-viral-green" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-surface-2 p-3 text-center">
                  <s.icon className={`mx-auto h-4 w-4 ${s.color} mb-1`} />
                  <p className="text-lg font-bold text-text-primary">{formatNumber(s.val)}</p>
                  <p className="text-[10px] text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 p-3">
              <div>
                <p className="text-xs text-text-muted">Engagement Rate</p>
                <p className="text-lg font-bold text-tiktok-cyan">{engRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">vs. Average</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${isAboveAvg ? "text-viral-green" : "text-tiktok-pink"}`}>
                  {isAboveAvg ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isAboveAvg ? "+" : ""}{viewsVsAvg}%
                </p>
              </div>
            </div>

            {video.share_url && (
              <a href={video.share_url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 flex w-full items-center justify-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4" />
                View on TikTok
              </a>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {!analysis && !analyzing && (
            <div className="card flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tiktok-pink/20 to-tiktok-cyan/20">
                <Sparkles className="h-8 w-8 text-text-muted" />
              </div>
              <p className="text-base font-semibold text-text-secondary">
                AI Deep Dive Analysis
              </p>
              <p className="mt-1 text-sm text-text-muted max-w-md text-center">
                Get a detailed AI breakdown of why this video performed the way it did,
                what worked, what didn&apos;t, and how to replicate its success.
              </p>
              <button onClick={runAnalysis} className="btn-primary mt-6 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Analyze This Video
              </button>
              {error && (
                <p className="mt-4 text-sm text-tiktok-pink">{error}</p>
              )}
            </div>
          )}

          {analyzing && (
            <div className="card flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-tiktok-pink mb-4" />
              <p className="text-sm text-text-muted">Analyzing this video with AI...</p>
            </div>
          )}

          {analysis && (
            <>
              {/* Score */}
              <div className="card">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black"
                    style={{
                      backgroundColor: getViralityColor(analysis.overallScore) + "15",
                      color: getViralityColor(analysis.overallScore),
                    }}
                  >
                    {analysis.overallScore}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Performance Score</h3>
                    <p className="text-sm text-text-secondary">{analysis.verdict}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-text-muted">{analysis.comparisonToAvg.summary}</p>
              </div>

              {/* What worked / didn't */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="card">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-viral-green mb-3">
                    <TrendingUp className="h-4 w-4" />
                    What Worked
                  </h4>
                  <ul className="space-y-2">
                    {analysis.whyItWorked.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-viral-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-tiktok-pink mb-3">
                    <TrendingDown className="h-4 w-4" />
                    What Could Improve
                  </h4>
                  <ul className="space-y-2">
                    {analysis.whyItDidnt.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-tiktok-pink" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Breakdown */}
              <div className="card">
                <h4 className="text-sm font-bold text-text-primary mb-4">Category Breakdown</h4>
                <div className="space-y-3">
                  {analysis.breakdown.map((cat) => {
                    const color = getViralityColor(cat.score);
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-text-primary">{cat.category}</span>
                          <span className="text-sm font-bold" style={{ color }}>{cat.score}/100</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                          <div className="h-full rounded-full" style={{ width: `${cat.score}%`, backgroundColor: color }} />
                        </div>
                        <p className="mt-1 text-xs text-text-muted">{cat.insight}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions */}
              <div className="card">
                <h4 className="text-sm font-bold text-text-primary mb-3">
                  How to Replicate & Improve
                </h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 rounded-xl bg-surface-2 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-tiktok-cyan/10 text-xs font-bold text-tiktok-cyan">
                        {i + 1}
                      </span>
                      <p className="text-sm text-text-secondary">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

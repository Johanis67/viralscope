"use client";

import { useState, useEffect } from "react";
import ContentIdeas from "@/components/ideas/ContentIdeas";
import { ContentIdea, TikTokUser, TikTokVideo } from "@/types";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Filter,
  TrendingUp,
  BarChart3,
  Lightbulb,
} from "lucide-react";

const sourceFilters = [
  { key: "all", label: "All Ideas", icon: Lightbulb },
  { key: "past-performance", label: "From Your Data", icon: BarChart3 },
  { key: "trending", label: "Trending", icon: TrendingUp },
  { key: "niche-analysis", label: "Niche Ideas", icon: Sparkles },
];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/tiktok/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/tiktok/videos").then((r) => (r.ok ? r.json() : null)),
    ]).then(([profileData, videosData]) => {
      if (profileData?.user) setUser(profileData.user);
      if (videosData?.videos) setVideos(videosData.videos);
    });
  }, []);

  async function generateIdeas() {
    setIsLoading(true);
    setError(null);

    try {
      const topVideos = [...videos]
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10)
        .map((v) => ({
          description: v.video_description || v.title || "",
          views: v.view_count,
          likes: v.like_count,
          comments: v.comment_count,
          shares: v.share_count,
          duration: v.duration,
        }));

      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followers: user?.follower_count || 0,
          displayName: user?.display_name || "",
          bio: user?.bio_description || "",
          videoCount: user?.video_count || 0,
          topVideos,
          customPrompt,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate ideas");
      }

      const data = await res.json();
      setIdeas(data.ideas);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredIdeas =
    filter === "all" ? ideas : ideas.filter((idea) => idea.source === filter);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              What kind of content are you looking for?
            </label>
            <textarea
              rows={2}
              placeholder='e.g., "Ideas similar to my top performing videos" or "Trending formats I should try"'
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
          <button
            onClick={generateIdeas}
            disabled={isLoading}
            className="btn-primary flex shrink-0 items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : ideas.length > 0 ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Ideas
              </>
            )}
          </button>
        </div>

        {user && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <Filter className="h-3.5 w-3.5" />
            Using data from{" "}
            <span className="font-medium text-tiktok-cyan">
              {user.display_name}
            </span>{" "}
            &middot;{" "}
            <span className="text-text-secondary">
              {videos.length} videos analyzed
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-tiktok-pink/10 border border-tiktok-pink/30 p-4 text-sm text-tiktok-pink">
          {error}
        </div>
      )}

      {ideas.length > 0 && (
        <div className="flex gap-2">
          {sourceFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-tiktok-pink/15 text-tiktok-pink border border-tiktok-pink/30"
                  : "bg-surface text-text-secondary border border-border hover:bg-surface-2"
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
        </div>
      )}

      {ideas.length > 0 ? (
        <ContentIdeas ideas={filteredIdeas} />
      ) : !isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tiktok-pink/20 to-tiktok-cyan/20">
            <Lightbulb className="h-8 w-8 text-text-muted" />
          </div>
          <p className="text-base font-semibold text-text-secondary">
            Get AI-powered content ideas
          </p>
          <p className="mt-1 text-sm text-text-muted max-w-md text-center">
            Ideas are generated from your actual TikTok performance data &mdash;
            what worked, what didn&apos;t, and what&apos;s trending in your
            space.
          </p>
          <button
            onClick={generateIdeas}
            className="btn-primary mt-6 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </button>
        </div>
      ) : null}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="shimmer h-4 w-24 rounded mb-3" />
              <div className="shimmer h-5 w-64 rounded mb-2" />
              <div className="shimmer h-4 w-full rounded mb-1" />
              <div className="shimmer h-4 w-3/4 rounded mb-4" />
              <div className="shimmer h-16 w-full rounded-xl mb-3" />
              <div className="flex gap-2">
                <div className="shimmer h-6 w-16 rounded" />
                <div className="shimmer h-6 w-20 rounded" />
                <div className="shimmer h-6 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

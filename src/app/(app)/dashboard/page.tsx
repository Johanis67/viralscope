"use client";

import { useState, useEffect } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import EngagementChart from "@/components/dashboard/EngagementChart";
import TopVideos from "@/components/dashboard/TopVideos";
import VideoInsights from "@/components/dashboard/VideoInsights";
import PerformancePatterns from "@/components/dashboard/PerformancePatterns";
import AccountHealth from "@/components/dashboard/AccountHealth";
import { TikTokUser, TikTokVideo } from "@/types";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, videosRes] = await Promise.all([
          fetch("/api/tiktok/profile"),
          fetch("/api/tiktok/videos"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData.user);
        } else {
          const errData = await profileRes.json();
          setError(errData.error || "Failed to load profile");
        }

        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setVideos(videosData.videos || []);
        }
      } catch {
        setError("Failed to connect to TikTok API");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-tiktok-pink" />
          <p className="text-sm text-text-muted">Loading your TikTok data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md text-center">
          <p className="text-tiktok-pink font-semibold">{error}</p>
          <p className="mt-2 text-sm text-text-muted">
            Make sure your TikTok connection is still active.
          </p>
          <a href="/api/auth/logout" className="btn-primary mt-4 inline-block">Reconnect</a>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const avgViews =
    videos.length > 0
      ? Math.round(videos.reduce((s, v) => s + v.view_count, 0) / videos.length)
      : 0;

  return (
    <div className="space-y-6">
      <StatsCards user={user} avgViews={avgViews} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <EngagementChart videos={videos} />
        </div>
        <div>
          <AccountHealth user={user} videos={videos} />
        </div>
      </div>

      <PerformancePatterns videos={videos} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VideoInsights videos={videos} />
        </div>
        <div>
          <TopVideos videos={videos} />
        </div>
      </div>
    </div>
  );
}

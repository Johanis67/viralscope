"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Video,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Zap,
  AlertCircle,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real Account Analytics",
    description:
      "See your actual follower count, views, engagement rates, and top performing videos pulled straight from TikTok.",
  },
  {
    icon: Video,
    title: "Virality Prediction",
    description:
      "Upload a new video before posting and get an AI-predicted virality score with detailed improvement tips.",
  },
  {
    icon: Lightbulb,
    title: "Personalized Content Ideas",
    description:
      "Get AI-generated content suggestions based on what actually performed well on your account and current trends.",
  },
  {
    icon: Zap,
    title: "Actionable Tips",
    description:
      "Specific, data-driven advice on hooks, captions, hashtags, posting times, and editing style.",
  },
];

export default function ConnectPage() {
  return (
    <Suspense>
      <ConnectPageInner />
    </Suspense>
  );
}

function ConnectPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document.cookie.includes("tiktok_connected=true")) {
      router.replace("/dashboard");
      return;
    }
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [router, searchParams]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-tiktok-pink/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-tiktok-cyan/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tiktok-purple/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tiktok-pink to-tiktok-cyan shadow-lg shadow-tiktok-pink/20">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-4xl font-black tracking-tight text-text-primary">
          ViralScope
        </h1>
        <p className="mt-2 text-lg text-text-secondary">
          Connect your TikTok to unlock AI-powered analytics and virality
          prediction
        </p>

        {/* Error display */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-tiktok-pink/10 border border-tiktok-pink/30 px-4 py-3 text-sm text-tiktok-pink">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Connection failed: {error}</span>
          </div>
        )}

        {/* Login button */}
        <a
          href="/api/auth/tiktok"
          className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-tiktok-pink to-[#ff4477] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-tiktok-pink/25 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-tiktok-pink/30"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.27a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.68z" />
          </svg>
          Login with TikTok
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </a>

        <p className="mt-4 text-xs text-text-muted">
          We only read your public profile and video data. We never post on your
          behalf.
        </p>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm transition-colors hover:border-border-bright"
          >
            <f.icon className="mb-3 h-6 w-6 text-tiktok-cyan" />
            <h3 className="text-sm font-bold text-text-primary">{f.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              {f.description}
            </p>
          </div>
        ))}
      </div>

      {/* Setup note */}
      <div className="relative z-10 mt-12 max-w-lg rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-sm">
        <h4 className="text-sm font-bold text-text-primary mb-2">
          First time? Quick setup:
        </h4>
        <ol className="space-y-2 text-xs text-text-muted">
          <li className="flex gap-2">
            <span className="shrink-0 font-bold text-tiktok-pink">1.</span>
            Create a TikTok Developer app at{" "}
            <a
              href="https://developers.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tiktok-cyan hover:underline"
            >
              developers.tiktok.com
            </a>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-bold text-tiktok-pink">2.</span>
            <span>
              Add redirect URI:{" "}
              <code className="rounded bg-surface-3 px-1 py-0.5 text-tiktok-cyan">
                http://localhost:3000/api/auth/callback
              </code>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-bold text-tiktok-pink">3.</span>
            <span>
              Copy Client Key & Secret into{" "}
              <code className="rounded bg-surface-3 px-1 py-0.5 text-tiktok-cyan">
                .env.local
              </code>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-bold text-tiktok-pink">4.</span>
            Enable scopes: user.info.basic, user.info.profile, user.info.stats,
            video.list
          </li>
        </ol>
      </div>
    </div>
  );
}

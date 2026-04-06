"use client";

import { useState, useEffect } from "react";
import VideoUploader from "@/components/analyze/VideoUploader";
import ViralityMeter from "@/components/analyze/ViralityMeter";
import AnalysisResults from "@/components/analyze/AnalysisResults";
import { AnalysisResult, VideoMetadataInput, TikTokVideo } from "@/types";
import { extractVideoFrames, formatNumber } from "@/lib/utils";
import { Sparkles, Loader2, Info } from "lucide-react";

export default function AnalyzePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastVideos, setPastVideos] = useState<TikTokVideo[]>([]);

  const [metadata, setMetadata] = useState<VideoMetadataInput>({
    caption: "",
    hashtags: "",
    niche: "Self-Improvement",
    targetAudience: "Young men 16-28, self-improvement / masculinity / discipline",
    postingTime: "",
  });
  const [noCaption, setNoCaption] = useState(false);
  const [noHashtags, setNoHashtags] = useState(false);

  useEffect(() => {
    fetch("/api/tiktok/videos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.videos) setPastVideos(data.videos);
      })
      .catch(() => {});
  }, []);

  function handleVideoSelected(file: File) {
    setVideoFile(file);
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!videoFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const frames = await extractVideoFrames(videoFile, 4);

      const avgViews =
        pastVideos.length > 0
          ? Math.round(
              pastVideos.reduce((s, v) => s + v.view_count, 0) /
                pastVideos.length
            )
          : undefined;

      const adjustedMetadata = {
        ...metadata,
        caption: noCaption ? "[NOT DECIDED - please suggest a caption]" : metadata.caption,
        hashtags: noHashtags ? "[NOT DECIDED - please recommend hashtags]" : metadata.hashtags,
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames,
          metadata: adjustedMetadata,
          suggestCaption: noCaption,
          suggestHashtags: noHashtags,
          accountContext: pastVideos.length > 0
            ? {
                avgViews,
                totalVideos: pastVideos.length,
                topVideoViews: Math.max(
                  ...pastVideos.map((v) => v.view_count)
                ),
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const avgViews =
    pastVideos.length > 0
      ? Math.round(
          pastVideos.reduce((s, v) => s + v.view_count, 0) / pastVideos.length
        )
      : null;

  return (
    <div className="space-y-6">
      {avgViews !== null && (
        <div className="rounded-xl bg-tiktok-cyan/5 border border-tiktok-cyan/20 px-4 py-3 text-sm text-tiktok-cyan flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          Analysis will be calibrated to your account (avg {formatNumber(avgViews)} views/video)
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <VideoUploader
            onVideoSelected={handleVideoSelected}
            isAnalyzing={isAnalyzing}
          />

          {videoFile && (
            <div className="card">
              <h3 className="mb-4 text-lg font-bold text-text-primary">
                Video Details
              </h3>
              <p className="mb-4 text-xs text-text-muted flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Add details for a more accurate prediction
              </p>

              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-text-secondary">
                      Caption
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNoCaption(!noCaption);
                        if (!noCaption) setMetadata({ ...metadata, caption: "" });
                      }}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all ${
                        noCaption
                          ? "bg-tiktok-cyan/15 text-tiktok-cyan"
                          : "bg-surface-2 text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      {noCaption ? "Suggest one for me" : "Don't know yet"}
                    </button>
                  </div>
                  {noCaption ? (
                    <div className="rounded-xl bg-tiktok-cyan/5 border border-tiktok-cyan/20 px-4 py-3 text-xs text-tiktok-cyan">
                      AI will suggest a caption based on the video content
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      placeholder="What caption will you use?"
                      value={metadata.caption}
                      onChange={(e) =>
                        setMetadata({ ...metadata, caption: e.target.value })
                      }
                    />
                  )}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-text-secondary">
                      Hashtags
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNoHashtags(!noHashtags);
                        if (!noHashtags) setMetadata({ ...metadata, hashtags: "" });
                      }}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all ${
                        noHashtags
                          ? "bg-tiktok-cyan/15 text-tiktok-cyan"
                          : "bg-surface-2 text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      {noHashtags ? "Recommend for me" : "Don't know yet"}
                    </button>
                  </div>
                  {noHashtags ? (
                    <div className="rounded-xl bg-tiktok-cyan/5 border border-tiktok-cyan/20 px-4 py-3 text-xs text-tiktok-cyan">
                      AI will recommend hashtags based on your niche and video content
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="#fyp #viral #selfimprovement"
                      value={metadata.hashtags}
                      onChange={(e) =>
                        setMetadata({ ...metadata, hashtags: e.target.value })
                      }
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                      Niche
                    </label>
                    <select
                      value={metadata.niche}
                      onChange={(e) =>
                        setMetadata({ ...metadata, niche: e.target.value })
                      }
                    >
                      <option value="">Select niche</option>
                      <option value="Self-Improvement">Self-Improvement / Motivation</option>
                      <option value="Masculinity">Masculinity / Discipline</option>
                      <option value="Fitness">Fitness / Health</option>
                      <option value="Business">Business / Finance</option>
                      <option value="Education">Education / How-to</option>
                      <option value="Lifestyle">Lifestyle / Vlog</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Food">Food</option>
                      <option value="Tech">Tech / Gaming</option>
                      <option value="Music">Music / Dance</option>
                      <option value="Sports">Sports</option>
                      <option value="Travel">Travel</option>
                      <option value="Pets">Pets</option>
                      <option value="DIY">DIY / Crafts</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Gen Z, 18-24"
                      value={metadata.targetAudience}
                      onChange={(e) =>
                        setMetadata({
                          ...metadata,
                          targetAudience: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    Planned Posting Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tuesday 7pm EST"
                    value={metadata.postingTime}
                    onChange={(e) =>
                      setMetadata({
                        ...metadata,
                        postingTime: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="btn-primary flex w-full items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Virality
                    </>
                  )}
                </button>

                {error && (
                  <div className="rounded-xl bg-tiktok-pink/10 border border-tiktok-pink/30 p-4 text-sm text-tiktok-pink">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {result ? (
            <>
              <ViralityMeter prediction={result.prediction} />
              <AnalysisResults result={result} />
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
                <Sparkles className="h-8 w-8 text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-secondary">
                Upload a video to see results
              </p>
              <p className="mt-1 text-xs text-text-muted text-center">
                AI will analyze your video and predict its viral potential,
                calibrated to your account
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

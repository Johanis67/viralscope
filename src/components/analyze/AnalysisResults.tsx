"use client";

import { AnalysisResult } from "@/types";
import { getViralityColor } from "@/lib/utils";
import {
  Zap,
  Film,
  Scissors,
  Music,
  FileText,
  Hash,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
} from "lucide-react";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const breakdownIcons: Record<string, React.ReactNode> = {
  hook: <Zap className="h-4 w-4" />,
  content: <Film className="h-4 w-4" />,
  editing: <Scissors className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  caption: <FileText className="h-4 w-4" />,
  hashtags: <Hash className="h-4 w-4" />,
  timing: <Clock className="h-4 w-4" />,
};

const breakdownLabels: Record<string, string> = {
  hook: "Hook (First 3s)",
  content: "Content Quality",
  editing: "Editing & Pacing",
  audio: "Audio & Sound",
  caption: "Caption",
  hashtags: "Hashtags",
  timing: "Timing",
};

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return (
    <div className="space-y-6">
      {/* Breakdown Scores */}
      <div className="card">
        <h3 className="mb-4 text-lg font-bold text-text-primary">
          Detailed Breakdown
        </h3>

        <div className="space-y-4">
          {Object.entries(result.breakdown).map(([key, data]) => {
            const color = getViralityColor(data.score);
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <span style={{ color }}>{breakdownIcons[key]}</span>
                    {breakdownLabels[key]}
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color }}
                  >
                    {data.score}/100
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${data.score}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}40`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-text-muted">{data.feedback}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Tips */}
      <div className="card">
        <h3 className="mb-4 text-lg font-bold text-text-primary">
          Improvement Tips
        </h3>

        <div className="space-y-3">
          {result.tips
            .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
            .map((tip, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl bg-surface-2 p-4 border border-border"
              >
                <span className="text-xl">{tip.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {tip.title}
                    </p>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        tip.priority === "high"
                          ? "bg-tiktok-pink/15 text-tiktok-pink"
                          : tip.priority === "medium"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-tiktok-cyan/15 text-tiktok-cyan"
                      }`}
                    >
                      {tip.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Key Factors */}
      <div className="card">
        <h3 className="mb-4 text-lg font-bold text-text-primary">
          Key Virality Factors
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.prediction.factors.map((factor, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-surface-2 p-3"
            >
              {factor.impact === "positive" ? (
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-viral-green" />
              ) : factor.impact === "negative" ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-tiktok-pink" />
              ) : (
                <ArrowUp className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
              )}
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {factor.name}
                </p>
                <p className="text-xs text-text-muted">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

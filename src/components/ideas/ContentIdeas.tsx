"use client";

import { ContentIdea } from "@/types";
import { getViralityColor, getViralityLabel } from "@/lib/utils";
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Hash,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface ContentIdeasProps {
  ideas: ContentIdea[];
}

const sourceLabels = {
  "past-performance": {
    label: "Based on Your Past",
    icon: BarChart3,
    color: "text-tiktok-cyan",
    bg: "bg-tiktok-cyan/10",
  },
  trending: {
    label: "Trending Now",
    icon: TrendingUp,
    color: "text-tiktok-pink",
    bg: "bg-tiktok-pink/10",
  },
  "niche-analysis": {
    label: "Niche Opportunity",
    icon: Sparkles,
    color: "text-tiktok-purple",
    bg: "bg-tiktok-purple/10",
  },
};

export default function ContentIdeas({ ideas }: ContentIdeasProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyHook(id: string, hook: string) {
    navigator.clipboard.writeText(hook);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea) => {
        const source = sourceLabels[idea.source];
        const color = getViralityColor(idea.estimatedViralPotential);

        return (
          <div key={idea.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${source.bg} ${source.color}`}
                  >
                    <source.icon className="h-3 w-3" />
                    {source.label}
                  </span>
                  <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                    {idea.format}
                  </span>
                </div>

                <h4 className="text-base font-bold text-text-primary">
                  {idea.title}
                </h4>
                <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                  {idea.description}
                </p>

                <div className="mt-3 rounded-xl bg-surface-2 p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-tiktok-cyan">
                      Hook
                    </p>
                    <button
                      onClick={() => copyHook(idea.id, idea.hook)}
                      className="text-text-muted hover:text-text-primary transition-colors"
                    >
                      {copiedId === idea.id ? (
                        <Check className="h-3.5 w-3.5 text-viral-green" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-text-primary italic">
                    &ldquo;{idea.hook}&rdquo;
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {idea.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-0.5 rounded-md bg-surface-2 px-2 py-1 text-xs text-text-muted"
                    >
                      <Hash className="h-3 w-3" />
                      {tag.replace("#", "")}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-xs text-text-muted italic">
                  {idea.reasoning}
                </p>
              </div>

              <div className="shrink-0 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black"
                  style={{
                    backgroundColor: color + "15",
                    color,
                  }}
                >
                  {idea.estimatedViralPotential}
                </div>
                <p className="mt-1 text-[10px] font-medium text-text-muted">
                  Viral Score
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

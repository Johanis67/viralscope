"use client";

import { getViralityColor, getViralityLabel, formatNumber } from "@/lib/utils";
import { ViralityPrediction } from "@/types";
import { TrendingUp, Target, Zap } from "lucide-react";

interface ViralityMeterProps {
  prediction: ViralityPrediction;
}

export default function ViralityMeter({ prediction }: ViralityMeterProps) {
  const color = getViralityColor(prediction.score);
  const label = getViralityLabel(prediction.score);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (prediction.score / 100) * circumference;

  return (
    <div className="card text-center">
      <h3 className="mb-6 text-lg font-bold text-text-primary">
        Virality Score
      </h3>

      <div className="relative mx-auto mb-6 h-48 w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="#2a2a4a"
            strokeWidth="8"
          />
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.5s ease-out",
              filter: `drop-shadow(0 0 8px ${color}60)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-black"
            style={{ color }}
          >
            {prediction.score}
          </span>
          <span className="text-xs font-medium text-text-muted">/100</span>
        </div>
      </div>

      <div
        className="mx-auto mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
        style={{
          backgroundColor: color + "15",
          color,
        }}
      >
        {label}
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">
        {prediction.overallVerdict}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface-2 p-3">
          <TrendingUp className="mx-auto mb-1 h-4 w-4 text-tiktok-pink" />
          <p className="text-xs text-text-muted">Low Est.</p>
          <p className="text-sm font-bold text-text-primary">
            {formatNumber(prediction.predictedViews.low)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-2 p-3">
          <Target className="mx-auto mb-1 h-4 w-4 text-tiktok-cyan" />
          <p className="text-xs text-text-muted">Mid Est.</p>
          <p className="text-sm font-bold text-text-primary">
            {formatNumber(prediction.predictedViews.mid)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-2 p-3">
          <Zap className="mx-auto mb-1 h-4 w-4 text-viral-green" />
          <p className="text-xs text-text-muted">High Est.</p>
          <p className="text-sm font-bold text-text-primary">
            {formatNumber(prediction.predictedViews.high)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1 text-xs text-text-muted">
        <span>Confidence:</span>
        <span className="font-semibold text-tiktok-purple">
          {prediction.confidence}%
        </span>
      </div>
    </div>
  );
}

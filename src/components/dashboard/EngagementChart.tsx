"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TikTokVideo } from "@/types";
import { formatNumber } from "@/lib/utils";

interface EngagementChartProps {
  videos: TikTokVideo[];
}

type MetricKey = "view_count" | "like_count" | "comment_count" | "share_count";

const metrics: { key: MetricKey; label: string; color: string }[] = [
  { key: "view_count", label: "Views", color: "#FE2C55" },
  { key: "like_count", label: "Likes", color: "#25F4EE" },
  { key: "comment_count", label: "Comments", color: "#6C63FF" },
  { key: "share_count", label: "Shares", color: "#00ff88" },
];

export default function EngagementChart({ videos }: EngagementChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("view_count");

  const data = [...videos]
    .sort((a, b) => a.create_time - b.create_time)
    .slice(-20)
    .map((v) => ({
      name: new Date(v.create_time * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: v[activeMetric],
      desc: (v.video_description || v.title || "").slice(0, 30),
    }));

  const activeColor =
    metrics.find((m) => m.key === activeMetric)?.color || "#FE2C55";

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary">
            Video Performance
          </h3>
          <p className="text-sm text-text-muted">
            Your last {data.length} videos
          </p>
        </div>
        <div className="flex gap-2">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  activeMetric === m.key ? m.color + "20" : "transparent",
                color: activeMetric === m.key ? m.color : "#555577",
                border: `1px solid ${activeMetric === m.key ? m.color + "40" : "#2a2a4a"}`,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis
                dataKey="name"
                stroke="#555577"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#555577"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => formatNumber(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #2a2a4a",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#f0f0f0" }}
                formatter={(value: number) => [
                  formatNumber(value),
                  metrics.find((m) => m.key === activeMetric)?.label,
                ]}
              />
              <Bar
                dataKey="value"
                fill={activeColor}
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            No video data available
          </div>
        )}
      </div>
    </div>
  );
}

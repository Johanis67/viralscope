"use client";

import { Users, Heart, Eye, Film } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { TikTokUser } from "@/types";

interface StatsCardsProps {
  user: TikTokUser;
  avgViews: number;
}

export default function StatsCards({ user, avgViews }: StatsCardsProps) {
  const cards = [
    {
      label: "Followers",
      value: user.follower_count,
      icon: Users,
      color: "text-tiktok-pink",
      bg: "bg-tiktok-pink/10",
    },
    {
      label: "Total Likes",
      value: user.likes_count,
      icon: Heart,
      color: "text-tiktok-cyan",
      bg: "bg-tiktok-cyan/10",
    },
    {
      label: "Avg Views / Video",
      value: avgViews,
      icon: Eye,
      color: "text-tiktok-purple",
      bg: "bg-tiktok-purple/10",
    },
    {
      label: "Videos Posted",
      value: user.video_count,
      icon: Film,
      color: "text-viral-green",
      bg: "bg-viral-green/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="card group">
          <div className="flex items-center justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
            >
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-text-primary">
              {formatNumber(card.value)}
            </p>
            <p className="text-sm text-text-muted">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Lightbulb,
  Settings,
  TrendingUp,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { TikTokUser } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/videos", label: "My Videos", icon: Video },
  { href: "/analyze", label: "Analyze New", icon: Sparkles },
  { href: "/ideas", label: "Content Ideas", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<TikTokUser | null>(null);

  useEffect(() => {
    fetch("/api/tiktok/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tiktok-pink to-tiktok-cyan">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary">ViralScope</h1>
          <p className="text-xs text-text-muted">TikTok Analytics</p>
        </div>
      </div>

      {/* Connected account */}
      {user && (
        <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl bg-surface-2 p-3 border border-border">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tiktok-pink/20 text-sm font-bold text-tiktok-pink">
              {user.display_name?.[0] || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {user.display_name}
            </p>
            <p className="text-xs text-viral-green flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-viral-green" />
              Connected
            </p>
          </div>
        </div>
      )}

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-tiktok-pink/15 text-tiktok-pink"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {isActive && (
                <Sparkles className="ml-auto h-3.5 w-3.5 text-tiktok-pink" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 space-y-2">
        <div className="rounded-xl bg-gradient-to-br from-tiktok-pink/10 to-tiktok-cyan/10 p-4 border border-border">
          <p className="text-xs font-semibold text-text-primary">
            AI Video Analysis
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Upload a video to get virality predictions before posting.
          </p>
          <Link
            href="/analyze"
            className="mt-3 inline-block rounded-lg bg-tiktok-pink px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-tiktok-pink/80"
          >
            Analyze Now
          </Link>
        </div>

        <a
          href="/api/auth/logout"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-tiktok-pink"
        >
          <LogOut className="h-4 w-4" />
          Disconnect Account
        </a>
      </div>
    </aside>
  );
}

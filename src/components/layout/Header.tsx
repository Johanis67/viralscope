"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your TikTok performance",
  },
  "/videos": {
    title: "My Videos",
    subtitle: "Browse, sort, and deep-dive into your content",
  },
  "/analyze": {
    title: "Analyze New Video",
    subtitle: "Predict virality before you post",
  },
  "/ideas": {
    title: "Content Ideas",
    subtitle: "AI-generated content suggestions for viral growth",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Configure your account and preferences",
  },
};

export default function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname || ""] || {
    title: "ViralScope",
    subtitle: "TikTok Analytics & Virality Predictor",
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/80 px-8 py-4 backdrop-blur-xl">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{page.title}</h2>
        <p className="text-sm text-text-muted">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="w-56 rounded-xl !py-2 !pl-10 !pr-4 text-sm"
          />
        </div>

        <button className="relative rounded-xl bg-surface-2 p-2.5 text-text-secondary transition-colors hover:text-text-primary border border-border">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

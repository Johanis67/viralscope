import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export function getEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  views: number
): number {
  if (views === 0) return 0;
  return ((likes + comments + shares) / views) * 100;
}

export function getViralityColor(score: number): string {
  if (score >= 80) return "#00ff88";
  if (score >= 60) return "#25F4EE";
  if (score >= 40) return "#FFC107";
  if (score >= 20) return "#FF6B35";
  return "#FE2C55";
}

export function getViralityLabel(score: number): string {
  if (score >= 80) return "Viral Potential";
  if (score >= 60) return "Strong Potential";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Needs Work";
  return "Low Potential";
}

export async function extractVideoFrames(
  file: File,
  numFrames: number = 4
): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const frames: string[] = [];

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      canvas.width = 480;
      canvas.height = 854;
      const duration = video.duration;
      const interval = duration / (numFrames + 1);
      let currentFrame = 0;

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.7));
        currentFrame++;

        if (currentFrame < numFrames) {
          video.currentTime = interval * (currentFrame + 1);
        } else {
          URL.revokeObjectURL(video.src);
          resolve(frames);
        }
      };

      video.currentTime = interval;
    };

    video.src = URL.createObjectURL(file);
  });
}

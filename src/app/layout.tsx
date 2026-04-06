import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViralScope - TikTok Analytics & Virality Predictor",
  description:
    "Connect your TikTok account for AI-powered virality prediction and content strategy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

// TikTok API response types

export interface TikTokUser {
  open_id: string;
  union_id?: string;
  avatar_url: string;
  display_name: string;
  bio_description?: string;
  profile_deep_link?: string;
  is_verified?: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

export interface TikTokVideo {
  id: string;
  title?: string;
  video_description: string;
  duration: number;
  cover_image_url: string;
  share_url: string;
  create_time: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

export interface TikTokVideoListResponse {
  data: {
    videos: TikTokVideo[];
    cursor: number;
    has_more: boolean;
  };
  error: { code: string; message: string };
}

export interface TikTokUserResponse {
  data: { user: TikTokUser };
  error: { code: string; message: string };
}

// App types

export interface ViralityPrediction {
  score: number;
  confidence: number;
  factors: ViralityFactor[];
  overallVerdict: string;
  predictedViews: { low: number; mid: number; high: number };
}

export interface ViralityFactor {
  name: string;
  score: number;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

export interface ImprovementTip {
  category: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  format: string;
  estimatedViralPotential: number;
  hashtags: string[];
  hook: string;
  source: "past-performance" | "trending" | "niche-analysis";
  reasoning: string;
}

export interface AnalysisResult {
  prediction: ViralityPrediction;
  tips: ImprovementTip[];
  breakdown: {
    hook: { score: number; feedback: string };
    content: { score: number; feedback: string };
    editing: { score: number; feedback: string };
    audio: { score: number; feedback: string };
    caption: { score: number; feedback: string };
    hashtags: { score: number; feedback: string };
    timing: { score: number; feedback: string };
  };
}

export interface VideoMetadataInput {
  caption: string;
  hashtags: string;
  niche: string;
  targetAudience: string;
  postingTime: string;
}

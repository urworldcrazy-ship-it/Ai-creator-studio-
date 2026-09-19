export type AppTab = 
  | "home" 
  | "text_to_video" 
  | "cartoon_story" 
  | "image_to_video" 
  | "image_gen" 
  | "voice_tts" 
  | "video_editor" 
  | "templates" 
  | "assistant" 
  | "history" 
  | "admin" 
  | "profile";

export type Language = "en" | "hi";
export type Theme = "dark" | "light";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "creator_pro" | "studio_ultra";
  credits: number;
  totalGenerated: number;
  createdAt: string;
  isBanned?: boolean;
}

export interface GenerationJob {
  id: string;
  userId: string;
  type: "text_to_video" | "cartoon_story" | "image_to_video" | "voiceover" | "image_gen";
  title: string;
  prompt: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  stageMessage: string;
  resultUrl?: string;
  resultData?: any;
  createdAt: string;
  aspectRatio?: string;
  duration?: number;
}

export interface SceneItem {
  sceneNumber: number;
  timeRange?: string;
  cameraShot?: string;
  visualPrompt: string;
  narration: string;
  subtitle: string;
  sfx?: string;
  animationType?: string;
  title?: string;
  dialogue?: string;
  duration?: number;
  bgGradient?: string;
}

export interface VideoScript {
  title: string;
  visualStyle: string;
  aspectRatio: string;
  duration: number;
  hook: string;
  scenes: SceneItem[];
  suggestedBgm: string;
  captionsStyle: string;
}

export interface TrendingTopic {
  title: string;
  viralScore: number;
  hook: string;
  suggestedTags: string[];
  angle: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "model";
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  messages: { sender: "user" | "admin"; text: string; time: string }[];
  createdAt: string;
}

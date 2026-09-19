export interface ShortsTemplate {
  id: string;
  name: string;
  category: "Facts" | "Story" | "Tech" | "Motivation" | "Gaming" | "Finance";
  description: string;
  previewImage: string;
  defaultHook: string;
  defaultPrompt: string;
  duration: number;
  bgmStyle: string;
  captionPreset: string;
  badge?: string;
}

export const SHORTS_TEMPLATES: ShortsTemplate[] = [
  {
    id: "tmpl-top5",
    name: "Top 5 Shocking Facts Countdown",
    category: "Facts",
    description: "Fast-paced countdown format with punchy sound effects and bold yellow captions.",
    previewImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    defaultHook: "Number 5 will completely change the way you think about space...",
    defaultPrompt: "5 bizarre astronomical anomalies discovered in the deep cosmos that scientists cannot explain.",
    duration: 15,
    bgmStyle: "Ticking Clock + Dramatic Sub Drops",
    captionPreset: "Karaoke Bold Yellow",
    badge: "Viral #1",
  },
  {
    id: "tmpl-motivation",
    name: "Dark Cinema Mindset Hook",
    category: "Motivation",
    description: "Deep baritone voiceover over moody cinematic slow-motion visuals with glowing subtitle pills.",
    previewImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    defaultHook: "Most people give up right when the breakthrough is 1 step away.",
    defaultPrompt: "A solitary runner training under rain in high-contrast cinematic noir lighting, motivational discipline arc.",
    duration: 12,
    bgmStyle: "Deep Cinematic Piano & Ambient Cello",
    captionPreset: "Minimal Glow Pill",
    badge: "Trending",
  },
  {
    id: "tmpl-myth-reality",
    name: "Myth vs Reality Split-Screen",
    category: "Tech",
    description: "Side-by-side or quick cut debunking common misconceptions about AI and productivity.",
    previewImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    defaultHook: "Stop doing this with AI! Here is the mistake 95% of users make.",
    defaultPrompt: "Side-by-side comparison of old clumsy video editing vs instant CreatorAI Studio vertical workflow.",
    duration: 15,
    bgmStyle: "Upbeat Lo-Fi Hip Hop",
    captionPreset: "Split Screen Red/Green",
  },
  {
    id: "tmpl-story-mystery",
    name: "Folklore & Urban Legend Story",
    category: "Story",
    description: "Suspenseful 3-scene animated visual narrative with chilling soundscapes and cliffhanger.",
    previewImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    defaultHook: "In 1928, a lighthouse keeper left behind a diary with one chilling final sentence.",
    defaultPrompt: "A secluded sea lighthouse battling giant ocean waves in a midnight tempest, antique diary pages glowing.",
    duration: 15,
    bgmStyle: "Dark Cinematic Strings & Fog Horn",
    captionPreset: "Antique Serif Fade",
    badge: "High Retention",
  },
  {
    id: "tmpl-hindi-kahani",
    name: "Panchatantra 3D Modern Animation",
    category: "Story",
    description: "Heartwarming 3D Pixar-style moral story crafted in authentic Hindi narration for family audiences.",
    previewImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    defaultHook: "जंगल के सबसे छोटे खरगोश ने शेर को ऐसी सीख दी जो कोई नहीं भूल पाया!",
    defaultPrompt: "Cute 3D animated rabbit outsmarting a proud lion near a crystal forest spring in Pixar style.",
    duration: 18,
    bgmStyle: "Indian Flute & Cheerful Percussion",
    captionPreset: "Vibrant Hindi Pop",
    badge: "Top in India",
  },
];

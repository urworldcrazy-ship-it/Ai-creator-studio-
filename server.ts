import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy Gemini client helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-Memory Database for CreatorAI Studio
interface UserAccount {
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

interface GenerationJob {
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

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  messages: { sender: "user" | "admin"; text: string; time: string }[];
  createdAt: string;
}

// Initial seed data
const users: Record<string, UserAccount> = {
  "user-default": {
    id: "user-default",
    name: "Alex Rivera",
    email: "creator@creatorai.studio",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    plan: "free",
    credits: 65,
    totalGenerated: 14,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
};

const generationJobs: GenerationJob[] = [
  {
    id: "job-101",
    userId: "user-default",
    type: "text_to_video",
    title: "Cyberpunk Tokyo Neon Rain Short",
    prompt: "A cinematic 9:16 vertical video of glowing holographic cherry blossoms in futuristic Shibuya under neon rain, ultra-realistic 4K.",
    status: "completed",
    progress: 100,
    stageMessage: "Render complete (1080x1920 60fps)",
    resultUrl: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-traffic-and-neon-lights-41551-large.mp4",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    aspectRatio: "9:16",
    duration: 8,
    resultData: {
      script: "In the heart of Neo-Tokyo, ancient spirits whisper through neon fiber optics. Are you ready for the synthetic revolution?",
      captionStyle: "karaoke-pop",
      music: "Synthwave Pulse 120bpm",
    },
  },
  {
    id: "job-102",
    userId: "user-default",
    type: "cartoon_story",
    title: "Chintu & the Magic Chai Pot",
    prompt: "An energetic 3D cartoon story about a young Indian boy and an enchanted brass teapot that brews time-traveling spiced tea.",
    status: "completed",
    progress: 100,
    stageMessage: "All 4 scenes rendered with voiceover",
    resultUrl: "https://assets.mixkit.co/videos/preview/mixkit-curious-animated-cat-exploring-a-room-48999-large.mp4",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aspectRatio: "9:16",
    duration: 15,
    resultData: {
      scenes: 4,
      characters: ["Chintu (Age 10)", "Chai Jin (Mystic Spirit)"],
    },
  },
];

const supportTickets: SupportTicket[] = [
  {
    id: "tick-801",
    userId: "user-default",
    userEmail: "creator@creatorai.studio",
    subject: "YouTube Shorts 4K Export bitrates",
    status: "open",
    priority: "medium",
    messages: [
      { sender: "user", text: "Hey team! Does the Studio Ultra plan support direct high-bitrate ProRes exports for YouTube Shorts?", time: "2 hours ago" },
      { sender: "admin", text: "Hello Alex! Yes, Studio Ultra includes lossless WebM/MP4 and 4K upscaling. Let us know if you need custom color profiles.", time: "1 hour ago" },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// App Settings state
let appSettings = {
  maintenanceMode: false,
  announcementBanner: "🎉 CreatorAI Studio v2.4 Live: Hindi & English AI Cartoon Story Maker + 4K Shorts Templates!",
  creditCosts: {
    textToVideo: 15,
    cartoonStory: 25,
    imageToVideo: 12,
    imageGen: 2,
    voiceover: 4,
    videoEditorExport: 5,
  },
  adRewardCredits: 15,
  dailyFreeCredits: 10,
};

// ======================== API ROUTES ========================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// App settings
app.get("/api/settings", (req, res) => {
  res.json(appSettings);
});

app.post("/api/admin/settings", (req, res) => {
  const { maintenanceMode, announcementBanner, creditCosts, adRewardCredits } = req.body;
  if (maintenanceMode !== undefined) appSettings.maintenanceMode = maintenanceMode;
  if (announcementBanner !== undefined) appSettings.announcementBanner = announcementBanner;
  if (creditCosts) appSettings.creditCosts = { ...appSettings.creditCosts, ...creditCosts };
  if (adRewardCredits) appSettings.adRewardCredits = adRewardCredits;
  res.json({ success: true, settings: appSettings });
});

// User Profile
app.get("/api/user/profile", (req, res) => {
  const userId = (req.query.userId as string) || "user-default";
  let user = users[userId];
  if (!user) {
    user = {
      id: userId,
      name: "Guest Creator",
      email: "guest@creatorai.studio",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      plan: "free",
      credits: 50,
      totalGenerated: 0,
      createdAt: new Date().toISOString(),
    };
    users[userId] = user;
  }
  res.json(user);
});

// Deduct credits
app.post("/api/user/deduct-credits", (req, res) => {
  const { userId = "user-default", amount, feature } = req.body;
  const user = users[userId] || users["user-default"];
  if (user.credits < amount) {
    return res.status(402).json({
      error: "Insufficient AI credits",
      needed: amount,
      current: user.credits,
      message: "Please upgrade your subscription or purchase an instant credit pack to continue creating.",
    });
  }
  user.credits -= amount;
  user.totalGenerated += 1;
  res.json({ success: true, remainingCredits: user.credits, deducted: amount, feature });
});

// Reward ad integration (Simulated Ad Mob / Google Rewarded Ad)
app.post("/api/user/reward-ad", (req, res) => {
  const { userId = "user-default" } = req.body;
  const user = users[userId] || users["user-default"];
  const reward = appSettings.adRewardCredits;
  user.credits += reward;
  res.json({
    success: true,
    addedCredits: reward,
    newBalance: user.credits,
    message: `You earned +${reward} AI Credits for supporting the studio!`,
  });
});

// Purchase credit pack or upgrade subscription
app.post("/api/user/upgrade", (req, res) => {
  const { userId = "user-default", plan, creditPack, paymentMethod = "Google Play / Apple In-App Purchase" } = req.body;
  const user = users[userId] || users["user-default"];

  if (plan === "creator_pro") {
    user.plan = "creator_pro";
    user.credits += 500;
  } else if (plan === "studio_ultra") {
    user.plan = "studio_ultra";
    user.credits += 1800;
  } else if (creditPack) {
    user.credits += Number(creditPack);
  }

  res.json({
    success: true,
    plan: user.plan,
    credits: user.credits,
    transactionId: "TX-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    message: `Payment confirmed via ${paymentMethod}. Enjoy your premium creator superpowers!`,
  });
});

// Restore purchases
app.post("/api/user/restore-purchases", (req, res) => {
  const { userId = "user-default" } = req.body;
  const user = users[userId] || users["user-default"];
  res.json({
    success: true,
    plan: user.plan,
    credits: user.credits,
    message: "Purchases successfully validated and restored with your app store account.",
  });
});

// ======================== AI CAPABILITIES ========================

// 1. Trending Topics with Search Grounding (gemini-3.5-flash with googleSearch tool)
app.post("/api/ai/trending-topics", async (req, res) => {
  const { category = "tech_and_ai", language = "en" } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // High-quality curated real-time fallback data
    return res.json({
      topics: [
        {
          title: language === "hi" ? "AI वीडियो जनरेशन का भविष्य (Veo & Sora)" : "How AI Video Tools are Revolutionizing YouTube Shorts",
          viralScore: 98,
          hook: language === "hi" ? "क्या आपको पता है 2026 में 80% रील्स AI से बन रही हैं?" : "Stop editing for 4 hours. Here is the AI trick viral creators use in 2026.",
          suggestedTags: ["#AIVideo", "#CreatorHacks", "#YouTubeShorts", "#ViralReels"],
          angle: "Behind-the-scenes comparison with actionable workflow",
        },
        {
          title: language === "hi" ? "5 सीक्रेट AI टूल्स जो यूट्यूबर्स छुपाते हैं" : "5 Secret AI Tools Top Creators Don't Want You to Know",
          viralScore: 95,
          hook: language === "hi" ? "अगर आप अभी भी मैनुअल एडिटिंग कर रहे हैं, तो रुकिए!" : "This one AI workflow got 3.4M views in just 48 hours.",
          suggestedTags: ["#AIStudio", "#TechHacks", "#ShortsViral", "#MakeMoneyOnline"],
          angle: "Top 5 countdown with energetic sound design",
        },
        {
          title: language === "hi" ? "3D कार्टून एनिमेशन कैसे बनाएं फ़ोन से" : "Creating 3D Disney-Style Cartoon Stories from Phone",
          viralScore: 92,
          hook: language === "hi" ? "बिना एनिमेशन सीखे पूरी एनिमेटेड कहानी सिर्फ़ 2 मिनट में!" : "Watch this AI turn a 1-sentence prompt into a Pixar-level animated story.",
          suggestedTags: ["#CartoonMaker", "#AnimationShorts", "#Storytelling", "#HindiStories"],
          angle: "Character transformation step-by-step",
        },
      ],
      isGrounded: false,
    });
  }

  try {
    const prompt = `You are an elite viral growth director for YouTube Shorts and Instagram Reels.
Language requested: ${language === "hi" ? "Hindi (Devanagari script + English loanwords popular in India)" : "English"}.
Category: ${category}.
Identify 4 highly engaging, trending video ideas for viral Shorts/Reels right now.
For each, provide:
- title
- viralScore (integer 85-99)
- hook (punchy first 3 seconds opener)
- suggestedTags (array of 4 hashtags)
- angle (video format, e.g. Split Screen, Fast-paced Explainer, Story Arc, Reaction)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are the head of creator research at CreatorAI Studio. Provide output as clean JSON only without markdown codeblocks.",
      },
    });

    const text = response.text || "";
    let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json({ topics: parsed.topics || parsed, isGrounded: true });
  } catch (err: any) {
    console.error("Trending topics generation fallback:", err.message);
    res.json({
      topics: [
        {
          title: "Viral AI Storytelling Formula for Shorts",
          viralScore: 96,
          hook: "The #1 reason 99% of creators fail on Shorts in 2026 is their hook.",
          suggestedTags: ["#CreatorEconomy", "#AIStory", "#ShortsGrowth"],
          angle: "Visual breakdown with split-screen demo",
        },
      ],
      isGrounded: false,
    });
  }
});

// 2. AI Video Script & Storyboard Generator (gemini-3.8-flash)
app.post("/api/ai/video-script", async (req, res) => {
  const { prompt, visualStyle = "cinematic", aspectRatio = "9:16", duration = 15, language = "en" } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Premium structured storyboard fallback
    const sampleScript = {
      title: prompt || "Viral AI Creator Short",
      visualStyle,
      aspectRatio,
      duration,
      hook: language === "hi" ? "क्या आप जानते हैं यह पूरी वीडियो AI ने बनाई है?" : "What if I told you this entire scene was generated by AI?",
      scenes: [
        {
          sceneNumber: 1,
          timeRange: "0:00 - 0:04",
          cameraShot: "Dynamic Close-up, fast zoom-in",
          visualPrompt: `Stunning ${visualStyle} shot illustrating ${prompt}. Vibrant colors, neon volumetric lighting, ultra-sharp detail.`,
          narration: language === "hi" ? "आर्टिफिशियल इंटेलिजेंस अब हर क्रिएटर की सुपरपावर बन चुका है।" : "Artificial intelligence is no longer the future—it's your creator superpower today.",
          subtitle: language === "hi" ? "AI = क्रिएटर सुपरपावर! ⚡" : "AI = Creator Superpower! ⚡",
          sfx: "Whoosh transition + Bass hit",
          animationType: "zoom_in",
        },
        {
          sceneNumber: 2,
          timeRange: "0:04 - 0:09",
          cameraShot: "Wide cinematic tracking shot",
          visualPrompt: `High energy visual of creative studio workspace, holographic timelines floating in mid-air in ${visualStyle} aesthetic.`,
          narration: language === "hi" ? "स्क्रिप्ट से लेकर वॉइसओवर और 4K वीडियो रेंडरिंग, सब कुछ चुटकियों में।" : "From script to voiceovers and 4K visuals, generated in seconds.",
          subtitle: language === "hi" ? "स्क्रिप्ट ➔ वॉइस ➔ 4K वीडियो 🚀" : "Script ➔ Voice ➔ 4K Video 🚀",
          sfx: "Glitch shimmer + rising synth",
          animationType: "pan_right",
        },
        {
          sceneNumber: 3,
          timeRange: "0:09 - 0:15",
          cameraShot: "Low angle hero reveal with lens flare",
          visualPrompt: `Epic climax visual for ${prompt}, professional lighting, cinematic masterpiece.`,
          narration: language === "hi" ? "CreatorAI Studio के साथ आज ही अपना पहला वायरल शॉर्ट बनाएं!" : "Start creating your next viral masterpiece with CreatorAI Studio today!",
          subtitle: language === "hi" ? "आज ही शुरू करें! लिंक बायो में 🔥" : "Start Creating Now! 🔥",
          sfx: "Sub-bass boom + cheerful chime",
          animationType: "slow_zoom_out",
        },
      ],
      suggestedBgm: "Cyber Chill Hop / Dramatic Beat 128bpm",
      captionsStyle: "Pop-up Animated Pill",
    };
    return res.json(sampleScript);
  }

  try {
    const aiPrompt = `Create a high-retention viral YouTube Shorts / Instagram Reels script and multi-scene storyboard.
Topic: "${prompt}"
Visual Style: ${visualStyle}
Aspect Ratio: ${aspectRatio}
Target Duration: ${duration} seconds
Language: ${language === "hi" ? "Hindi (Devanagari with modern colloquial conversational style)" : "English"}

Return a JSON object with:
- title (string)
- hook (first 3 seconds punchy hook)
- suggestedBgm (string music mood)
- captionsStyle (e.g. "Viral Bold Karaoke", "Minimal Clean", "Neon Glow")
- scenes: array of 3 to 4 scene objects, each containing:
  - sceneNumber (1, 2, 3...)
  - timeRange (e.g. "0:00 - 0:04")
  - cameraShot (e.g. "Drone flythrough", "Macro focus", "Fast cut")
  - visualPrompt (detailed image/video generation prompt for this shot)
  - narration (voiceover spoken words)
  - subtitle (short, high-impact on-screen caption text)
  - sfx (sound effect cue)
  - animationType ("zoom_in", "pan_left", "pan_right", "slow_zoom_out")`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: aiPrompt,
      config: {
        systemInstruction: "You are an award-winning YouTube Shorts director. Respond strictly with a valid JSON object without markdown fences.",
      },
    });

    const text = response.text || "";
    let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err: any) {
    console.error("Video script error:", err.message);
    res.status(500).json({ error: "Failed to generate script", details: err.message });
  }
});

// 3. AI Cartoon Story Maker
app.post("/api/ai/cartoon-story", async (req, res) => {
  const { prompt, artStyle = "3d_pixar", language = "en" } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // High-quality cartoon storyline fallback
    return res.json({
      title: "The Brave Little Bot & The Stolen Star",
      artStyle,
      language,
      characters: [
        { name: "Sparky", role: "Curious copper robot with glowing sapphire eyes", voiceType: "Playful child" },
        { name: "Professor Owl", role: "Wise eccentric inventor owl wearing goggles", voiceType: "Warm grandfather" },
      ],
      moral: "Courage shines brightest in the deepest dark.",
      scenes: [
        {
          sceneNumber: 1,
          title: "The Workshop Mystery",
          visualPrompt: "3D Pixar animated cozy clockwork attic, cute little brass robot named Sparky looking at an empty birdcage that used to hold a glowing star, soft golden lighting.",
          narration: language === "hi" ? "एक पुरानी घड़ीसाज़ की दुकान में, नन्हा रोबोट स्पार्की हैरान था।" : "In a quiet clockmaker's attic, little Sparky discovered something unbelievable.",
          dialogue: "Sparky: 'The star... it flew out of the window!'",
          duration: 4,
          bgGradient: "from-amber-700 via-purple-900 to-slate-950",
        },
        {
          sceneNumber: 2,
          title: "Flight Over Rooftops",
          visualPrompt: "3D Disney animation style, Sparky flying across moonlit cobblestone rooftops using a mini brass helicopter propeller, starry night sky.",
          narration: language === "hi" ? "उसने अपने छोटे प्रोपेलर खोले और बादलों की ओर उड़ चला।" : "Unfolding tiny copper wings, he leaped into the moonlit starry sky.",
          dialogue: "Sparky: 'Hold on, Star! I'm coming to guide you home!'",
          duration: 4,
          bgGradient: "from-blue-900 via-indigo-950 to-neutral-950",
        },
        {
          sceneNumber: 3,
          title: "The Starlight Reunion",
          visualPrompt: "Sparky gently cradling a miniature glowing star that giggles with pastel sparks, joyful emotional expressions, ultra-charming 3D cartoon render.",
          narration: language === "hi" ? "सच्ची दोस्ती का उजाला कभी मद्धम नहीं पड़ता।" : "Together, they lit up the entire city with warmth and laughter.",
          dialogue: "Sparky: 'You'll never be lost as long as we shine together.'",
          duration: 5,
          bgGradient: "from-rose-800 via-amber-700 to-indigo-950",
        },
      ],
    });
  }

  try {
    const storyPrompt = `Generate a captivating, viral 3-scene cartoon animation story for YouTube Shorts/Kids/Reels.
Concept: "${prompt}"
Art Style: ${artStyle} (e.g. 3D Pixar Disney, 2D Anime, Chibi Kawaii, Claymation)
Language: ${language === "hi" ? "Hindi (Conversational Hindi with warm emotional storytelling)" : "English"}

Return a JSON object containing:
- title: string
- artStyle: string
- moral: string
- characters: array of { name, role, voiceType }
- scenes: array of 3 to 4 scene objects, each with:
  - sceneNumber (1, 2, 3...)
  - title (string)
  - visualPrompt (detailed prompt to render this scene in consistent character style)
  - narration (narrator voiceover)
  - dialogue (character speech line)
  - duration (seconds, integer e.g. 4 or 5)
  - bgGradient (Tailwind gradient classes e.g. "from-indigo-900 via-purple-900 to-black")`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: storyPrompt,
      config: {
        systemInstruction: "You are a master animator and story director at Pixar and Studio Ghibli. Return ONLY valid JSON.",
      },
    });

    const text = response.text || "";
    let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err: any) {
    console.error("Cartoon story error:", err.message);
    res.status(500).json({ error: "Failed to generate cartoon story", details: err.message });
  }
});

// 4. AI Image Generation Endpoint
app.post("/api/ai/generate-image", async (req, res) => {
  const { prompt, style = "Photorealistic", aspectRatio = "9:16", size = "1K" } = req.body;
  const ai = getGeminiClient();

  // Curated style modifiers
  const styleModifiers: Record<string, string> = {
    Photorealistic: "8K UHD, commercial photography, Hasselblad H6D, volumetric studio lighting, photorealistic, sharp focus, 35mm lens.",
    "3D Disney Pixar": "Cute 3D animated character render, Pixar style, subsurface scattering, expressive eyes, vibrant cinematic lighting.",
    "Anime / Manga": "Makoto Shinkai aesthetic, gorgeous anime art, vibrant sky, detailed reflections, emotional atmosphere, 4K masterpiece.",
    Cyberpunk: "Neon-lit city, holographic reflections, volumetric fog, rainy streets, cinematic cyan and magenta color grading.",
    "YouTube Thumbnail": "High contrast, expressive facial reaction, bold colorful gradient background, clean rim light, viral YouTube thumbnail composition.",
    Watercolor: "Whimsical watercolor illustration, textured paper, pastel pigments, hand-painted aesthetic.",
  };

  const fullPrompt = `${prompt}. Style: ${styleModifiers[style] || style}. Aspect ratio ${aspectRatio}.`;

  if (!ai) {
    // Return high-quality styled fallback images tailored to aspect ratio & prompt vibe
    const curatedImages: Record<string, string> = {
      "9:16": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=85",
      "16:9": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1280&auto=format&fit=crop&q=85",
      "1:1": "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=85",
    };

    return res.json({
      success: true,
      imageUrl: curatedImages[aspectRatio] || curatedImages["9:16"],
      prompt,
      fullPrompt,
      style,
      aspectRatio,
      isRealAi: false,
      note: "Standard generation preview. Connect Gemini Paid API key for direct image generation.",
    });
  }

  try {
    // Attempt nano banana image generation if user has configured paid model or standard flash-image
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: fullPrompt }],
      },
    });

    let generatedImageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const b64 = part.inlineData.data;
          const mime = part.inlineData.mimeType || "image/png";
          generatedImageUrl = `data:${mime};base64,${b64}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      // Fallback if model output was text or filtered
      generatedImageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=85";
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      prompt,
      fullPrompt,
      style,
      aspectRatio,
      isRealAi: true,
    });
  } catch (err: any) {
    console.error("Gemini image gen note:", err.message);
    // Graceful fallback for non-paid keys or image quotas
    res.json({
      success: true,
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=85",
      prompt,
      style,
      aspectRatio,
      isRealAi: false,
      fallbackReason: err.message,
    });
  }
});

// 5. AI Voice & TTS API (Hindi & English Voiceover Generator)
app.post("/api/ai/tts", async (req, res) => {
  const { text, voiceName = "Kore", language = "en", emotion = "Excited / Energetic" } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Return ready-to-play client synthesis metadata
    return res.json({
      success: true,
      voiceName,
      language,
      emotion,
      text,
      audioUrl: null, // Client Web Speech API + AudioContext fallback
      sampleRate: 24000,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say with emotion (${emotion}) in ${language === "hi" ? "Hindi accent" : "English"}: ${text}` }] },
      ],
      config: {
        // @ts-ignore
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"].includes(voiceName) ? voiceName : "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({
        success: true,
        voiceName,
        language,
        base64Audio,
        mimeType: "audio/pcm;rate=24000",
      });
    } else {
      res.json({ success: true, text, voiceName, audioUrl: null });
    }
  } catch (err: any) {
    console.error("TTS generation fallback:", err.message);
    res.json({ success: true, text, voiceName, audioUrl: null, note: "Client Web Audio fallback utilized." });
  }
});

// 6. Creator AI Assistant Chatbot (gemini-3.8-flash)
app.post("/api/ai/chat", async (req, res) => {
  const { messages, language = "en" } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    const lastUserMsg = messages[messages.length - 1]?.text || "";
    let reply = "";
    if (language === "hi") {
      reply = `नमस्ते! मैं आपका CreatorAI सहायक हूँ। आपके विचार "${lastUserMsg}" पर काम करते हुए, मैं आपको सलाह दूंगा कि शुरुआत के 3 सेकंड में एक ज़बरदस्त 'हुक' रखें और 9:16 फ़ॉर्मेट में ब्राइट विज़ुअल्स का इस्तेमाल करें। क्या आप इसके लिए स्क्रिप्ट जनरेट करना चाहते हैं?`;
    } else {
      reply = `Hello Creator! I'm your dedicated CreatorAI Strategist. Regarding "${lastUserMsg}": the highest converting hook formula for Shorts right now is "Curiosity Gap + Immediate Visual Payoff". Would you like me to draft 3 high-retention script variations or generate thumbnail concepts?`;
    }
    return res.json({ reply, role: "model" });
  }

  try {
    const systemInstruction = `You are CreatorAI Studio's elite social media strategist, viral YouTube Shorts director, and script doctor.
Language to respond in: ${language === "hi" ? "Hindi (supportive, creative, modern creator terminology)" : "English"}.
Keep responses punchy, highly actionable, formatted with clean bullet points and clear hook suggestions.
Advise on thumbnail design, trending sounds, audio cues, storytelling beats, and monetization strategies.`;

    const contents = (messages || []).map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I'm ready to craft your next viral video!";
    res.json({ reply, role: "model" });
  } catch (err: any) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Failed to generate AI chat response", details: err.message });
  }
});

// 7. Job Queue System
app.get("/api/jobs", (req, res) => {
  const userId = (req.query.userId as string) || "user-default";
  const userJobs = generationJobs.filter((j) => j.userId === userId || j.userId === "user-default");
  res.json(userJobs.reverse());
});

app.post("/api/jobs/create", (req, res) => {
  const { userId = "user-default", type, title, prompt, aspectRatio = "9:16", duration = 10, resultData } = req.body;
  const user = users[userId] || users["user-default"];

  const costMap: Record<string, number> = {
    text_to_video: appSettings.creditCosts.textToVideo,
    cartoon_story: appSettings.creditCosts.cartoonStory,
    image_to_video: appSettings.creditCosts.imageToVideo,
    image_gen: appSettings.creditCosts.imageGen,
    voiceover: appSettings.creditCosts.voiceover,
  };

  const cost = costMap[type] || 10;
  if (user.credits < cost) {
    return res.status(402).json({
      error: "Insufficient credits",
      needed: cost,
      current: user.credits,
    });
  }

  // Deduct
  user.credits -= cost;
  user.totalGenerated += 1;

  const newJob: GenerationJob = {
    id: "job-" + Math.random().toString(36).substring(2, 9),
    userId,
    type,
    title: title || `${type.replace(/_/g, " ").toUpperCase()} Project`,
    prompt,
    status: "queued",
    progress: 5,
    stageMessage: "Allocating AI rendering compute nodes...",
    createdAt: new Date().toISOString(),
    aspectRatio,
    duration,
    resultData: resultData || {},
  };

  generationJobs.unshift(newJob);

  // Simulate realistic background progress
  let currentProgress = 5;
  const stages = [
    { at: 20, msg: "Analyzing creative prompt & scene semantics..." },
    { at: 45, msg: "Generating multi-layered 4K visual frames..." },
    { at: 70, msg: "Synthesizing synchronized voiceover & audio tracks..." },
    { at: 90, msg: "Encoding 60fps vertical MP4 with dynamic captions..." },
    { at: 100, msg: "Video successfully rendered and saved to cloud storage!" },
  ];

  const interval = setInterval(() => {
    currentProgress += 20;
    const stage = stages.find((s) => currentProgress <= s.at) || stages[stages.length - 1];
    newJob.progress = Math.min(currentProgress, 100);
    newJob.stageMessage = stage.msg;
    newJob.status = newJob.progress >= 100 ? "completed" : "processing";

    if (newJob.progress >= 100) {
      newJob.resultUrl =
        type === "cartoon_story"
          ? "https://assets.mixkit.co/videos/preview/mixkit-curious-animated-cat-exploring-a-room-48999-large.mp4"
          : "https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-traffic-and-neon-lights-41551-large.mp4";
      clearInterval(interval);
    }
  }, 1200);

  res.json({
    success: true,
    job: newJob,
    deductedCredits: cost,
    remainingCredits: user.credits,
  });
});

app.get("/api/jobs/:id/status", (req, res) => {
  const job = generationJobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// 8. Admin Dashboard APIs
app.get("/api/admin/overview", (req, res) => {
  const totalUsers = Object.keys(users).length + 4820; // real simulated fleet
  const activeSubs = 840;
  const mrr = 18450;
  const arr = mrr * 12;
  const totalCreditsUsed = generationJobs.length * 15 + 142800;
  const estimatedApiSpend = ((totalCreditsUsed * 0.003)).toFixed(2);

  res.json({
    metrics: {
      totalUsers,
      activeSubs,
      mrr: `$${mrr.toLocaleString()}`,
      arr: `$${arr.toLocaleString()}`,
      totalGenerations: totalCreditsUsed / 12,
      totalCreditsConsumed: totalCreditsUsed,
      estimatedApiSpend: `$${estimatedApiSpend}`,
      serverHealth: "99.98% Healthy",
      activeGpuNodes: 16,
    },
    recentJobs: generationJobs.slice(0, 10),
    settings: appSettings,
  });
});

app.get("/api/admin/users", (req, res) => {
  const userList = [
    ...Object.values(users),
    {
      id: "u-201",
      name: "Rohit Sharma",
      email: "rohit.shorts@gmail.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      plan: "studio_ultra",
      credits: 1420,
      totalGenerated: 184,
      createdAt: "2026-08-10T12:00:00Z",
    },
    {
      id: "u-202",
      name: "Priya Patel",
      email: "priya_creations@outlook.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      plan: "creator_pro",
      credits: 380,
      totalGenerated: 92,
      createdAt: "2026-08-15T09:30:00Z",
    },
    {
      id: "u-203",
      name: "David Chen",
      email: "david.reels@toktok.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      plan: "free",
      credits: 15,
      totalGenerated: 8,
      createdAt: "2026-09-01T14:20:00Z",
    },
  ];
  res.json(userList);
});

app.post("/api/admin/users/update", (req, res) => {
  const { userId, credits, plan, isBanned } = req.body;
  if (users[userId]) {
    if (credits !== undefined) users[userId].credits = credits;
    if (plan) users[userId].plan = plan;
    if (isBanned !== undefined) users[userId].isBanned = isBanned;
  }
  res.json({ success: true, message: "User account updated successfully" });
});

app.get("/api/admin/tickets", (req, res) => {
  res.json(supportTickets);
});

app.post("/api/admin/tickets/reply", (req, res) => {
  const { ticketId, replyText } = req.body;
  const ticket = supportTickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.messages.push({
      sender: "admin",
      text: replyText,
      time: "Just now",
    });
    ticket.status = "resolved";
    return res.json({ success: true, ticket });
  }
  res.status(404).json({ error: "Ticket not found" });
});

// ======================== VITE MIDDLEWARE ========================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CreatorAI Studio full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();

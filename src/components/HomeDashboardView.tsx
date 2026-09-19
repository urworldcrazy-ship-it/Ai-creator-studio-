import React, { useState, useEffect } from "react";
import { 
  Sparkles, Film, Smile, Wand2, Mic, Image as ImageIcon, 
  Scissors, TrendingUp, Zap, ArrowRight, Play, Star, 
  Globe, ShieldCheck, Flame, Compass, ChevronRight 
} from "lucide-react";
import { Language, UserAccount, AppTab, TrendingTopic } from "../types";
import { SHORTS_TEMPLATES, ShortsTemplate } from "../data/templates";
import { translations } from "../data/translations";

interface HomeDashboardViewProps {
  user: UserAccount;
  language: Language;
  onNavigateTab: (tab: AppTab) => void;
  onOpenCreditsModal: () => void;
  onUseTemplate: (template: ShortsTemplate) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  user,
  language,
  onNavigateTab,
  onOpenCreditsModal,
  onUseTemplate,
}) => {
  const t = translations[language];
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);

  useEffect(() => {
    async function loadTrends() {
      try {
        const res = await fetch("/api/ai/trending-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "viral_shorts", language }),
        });
        const data = await res.json();
        if (data.topics) {
          setTrendingTopics(data.topics.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadTrends();
  }, [language]);

  const tools = [
    {
      id: "text_to_video" as AppTab,
      title: t.textToVideoTitle,
      desc: language === "hi" ? "स्क्रिप्ट, 4K दृश्य, वॉयसओवर और सबटाइटल" : "Script, 4K scenes, voiceover & animated captions",
      icon: Film,
      badge: "Popular",
      color: "from-rose-500 to-red-600",
      cost: "15 Cr",
    },
    {
      id: "cartoon_story" as AppTab,
      title: t.cartoonStoryTitle,
      desc: language === "hi" ? "3D पिक्सर कार्टून, संवाद और मल्टी-सीन एनिमेशन" : "3D Pixar animations, multi-scene story & dialogues",
      icon: Smile,
      badge: "New",
      color: "from-amber-500 to-orange-600",
      cost: "25 Cr",
    },
    {
      id: "image_to_video" as AppTab,
      title: t.imageToVideoTitle,
      desc: language === "hi" ? "फ़ोटो को डायनेमिक 4K सिनेमाई वीडियो में बदलें" : "Turn still photos into cinematic motion video",
      icon: Wand2,
      badge: "Viral",
      color: "from-purple-500 to-indigo-600",
      cost: "12 Cr",
    },
    {
      id: "voice_tts" as AppTab,
      title: t.voiceTtsTitle,
      desc: language === "hi" ? "स्वाभाविक हिंदी और अंग्रेजी वॉयसओवर जनरेटर" : "Ultra-realistic Hindi & English studio voices",
      icon: Mic,
      badge: "Gemini TTS",
      color: "from-blue-500 to-cyan-600",
      cost: "4 Cr",
    },
    {
      id: "image_gen" as AppTab,
      title: t.imageGenTitle,
      desc: language === "hi" ? "वायरल यूट्यूब थंबनेल और 8K डिजिटल आर्ट" : "Viral YouTube thumbnails & 8K anime/concept art",
      icon: ImageIcon,
      badge: "Fast",
      color: "from-emerald-500 to-teal-600",
      cost: "2 Cr",
    },
    {
      id: "video_editor" as AppTab,
      title: t.videoEditorTitle,
      desc: language === "hi" ? "कैप्शन, बीजीएम संगीत, ट्रिमिंग और वॉटरमार्क रिमूवल" : "Auto captions, royalty-free BGM, trimming & 4K export",
      icon: Scissors,
      badge: "Studio",
      color: "from-pink-500 to-rose-600",
      cost: "Free",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Creator Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950 via-purple-950 to-neutral-900 border border-neutral-800 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === "hi" ? "ऑल-इन-वन AI क्रिएटर प्लेटफॉर्म" : "All-in-One AI Studio for Shorts & Reels"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight leading-tight">
            {language === "hi"
              ? "एक क्लिक में वायरल AI वीडियो बनाएं"
              : "Generate Viral AI Videos in Seconds"}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
            {language === "hi"
              ? "टेक्स्ट-टू-वीडियो, 3D कार्टून कहानियां, वॉइसओवर और प्रो एडिटर के साथ अपने यूट्यूब चैनल और रील्स को तेज़ी से ग्रो करें।"
              : "Create high-retention YouTube Shorts, 3D cartoon animations, realistic Hindi/English voiceovers, and edit without watermarks."}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onNavigateTab("text_to_video")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 transition"
            >
              <Film className="w-4 h-4" />
              <span>{language === "hi" ? "AI वीडियो जनरेटर खोलें" : "Create AI Video"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            <button
              onClick={() => onNavigateTab("cartoon_story")}
              className="px-4 py-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold text-xs flex items-center gap-2 transition"
            >
              <Smile className="w-4 h-4 text-amber-400" />
              <span>{language === "hi" ? "3D कार्टून स्टोरी मेकर" : "3D Cartoon Story"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Trending Hooks Bar */}
      {trendingTopics.length > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {language === "hi" ? "आज के ट्रेंडिंग वायरल शॉर्ट्स आइडियाज" : "Trending Shorts Ideas Today"}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("templates")}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-0.5"
            >
              <span>{language === "hi" ? "सभी देखें" : "View All"}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {trendingTopics.map((topic, i) => (
              <div
                key={i}
                onClick={() => onNavigateTab("text_to_video")}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-rose-500/40 transition cursor-pointer flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{topic.title}</span>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded">
                    {topic.viralScore}%
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 line-clamp-1 italic">
                  "{topic.hook}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Tools Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white font-display">
            {language === "hi" ? "AI क्रिएशन टूल्स सूट" : "AI Creative Tools Suite"}
          </h2>
          <span className="text-xs text-neutral-400">
            6 Specialized Studios
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigateTab(tool.id)}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-xl text-left transition flex items-start gap-3.5 group hover:scale-101"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition truncate">
                      {tool.title}
                    </h3>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-semibold border border-neutral-700 flex-shrink-0">
                      {tool.cost}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Templates Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white font-display">
            {language === "hi" ? "लोकप्रिय शॉर्ट्स टेम्प्लेट्स" : "Popular Shorts Templates"}
          </h2>
          <button
            onClick={() => onNavigateTab("templates")}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-0.5"
          >
            <span>{language === "hi" ? "सभी टेम्प्लेट" : "Explore All"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SHORTS_TEMPLATES.slice(0, 4).map((t) => (
            <div
              key={t.id}
              onClick={() => onUseTemplate(t)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-rose-500/50 transition cursor-pointer group shadow-lg"
            >
              <img
                src={t.previewImage}
                alt={t.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-extrabold uppercase">
                {t.badge || t.category}
              </div>

              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[9px] text-amber-300 font-bold block">
                  {t.duration}s
                </span>
                <span className="text-xs font-bold text-white line-clamp-2 leading-tight">
                  {t.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

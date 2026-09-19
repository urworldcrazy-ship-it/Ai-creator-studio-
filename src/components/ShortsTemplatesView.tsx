import React, { useState, useEffect } from "react";
import { 
  LayoutTemplate, Sparkles, TrendingUp, Play, ArrowRight, 
  Search, Globe, Layers, Zap, CheckCircle2 
} from "lucide-react";
import { Language, UserAccount, TrendingTopic } from "../types";
import { SHORTS_TEMPLATES, ShortsTemplate } from "../data/templates";
import { translations } from "../data/translations";

interface ShortsTemplatesViewProps {
  user: UserAccount;
  language: Language;
  onUseTemplate: (template: ShortsTemplate) => void;
  onUseTrendingTopic: (topic: TrendingTopic) => void;
}

export const ShortsTemplatesView: React.FC<ShortsTemplatesViewProps> = ({
  user,
  language,
  onUseTemplate,
  onUseTrendingTopic,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  const categories = ["All", "Facts", "Story", "Tech", "Motivation"];

  const filteredTemplates = selectedCategory === "All"
    ? SHORTS_TEMPLATES
    : SHORTS_TEMPLATES.filter((tmpl) => tmpl.category === selectedCategory);

  // Fetch Search Grounded trending topics via Gemini with Google Search tool
  useEffect(() => {
    async function loadTrends() {
      setIsLoadingTrends(true);
      try {
        const res = await fetch("/api/ai/trending-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "viral_shorts", language }),
        });
        const data = await res.json();
        if (data.topics) {
          setTrendingTopics(data.topics);
        }
      } catch (err) {
        console.error("Trends error:", err);
      } finally {
        setIsLoadingTrends(false);
      }
    }
    loadTrends();
  }, [language]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {t.templatesTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t.templatesDesc}
          </p>
        </div>
      </div>

      {/* Google Search Grounded Trending Section */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-purple-950/40 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white font-display">
              {t.trendingIdeas}
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold flex items-center gap-1 border border-blue-500/30">
            <Globe className="w-3 h-3 text-blue-400" />
            Google Search Grounded
          </span>
        </div>
        <p className="text-xs text-neutral-400">
          {t.trendingDesc}
        </p>

        {/* Trending Cards Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {trendingTopics.map((topic, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 hover:border-rose-500/50 transition flex flex-col justify-between gap-2.5 group"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white group-hover:text-rose-400 transition">
                    {topic.title}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 flex-shrink-0">
                    {topic.viralScore}% Viral
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-1 italic line-clamp-2">
                  Hook: "{topic.hook}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-900">
                <div className="flex flex-wrap gap-1">
                  {topic.suggestedTags?.slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} className="text-[9px] text-neutral-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onUseTrendingTopic(topic)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[10px] font-bold transition flex items-center gap-1"
                >
                  <span>Build Script</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedCategory === cat
                ? "bg-rose-500/20 border-rose-500 text-rose-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-neutral-700 transition flex flex-col group"
          >
            {/* Visual Thumbnail */}
            <div className="relative aspect-[16/9] bg-neutral-950 overflow-hidden">
              <img
                src={template.previewImage}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {template.badge && (
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold uppercase shadow-lg">
                  {template.badge}
                </div>
              )}

              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  {template.category} • {template.duration}s
                </span>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {template.name}
                </h3>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {template.description}
                </p>
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Proven Hook:
                  </span>
                  <p className="text-xs text-white italic line-clamp-2 mt-0.5">
                    "{template.defaultHook}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-neutral-400 font-mono">
                  BGM: {template.bgmStyle}
                </span>
                <button
                  onClick={() => onUseTemplate(template)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition shadow flex items-center gap-1.5"
                >
                  <span>{t.tryTemplate}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

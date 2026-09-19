import React from "react";
import { X, Video, Smile, Image as ImageIcon, Mic, Wand2, LayoutTemplate, Zap } from "lucide-react";
import { AppTab, Language } from "../types";
import { translations } from "../data/translations";

interface CreationHubModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onSelectFeature: (tab: AppTab) => void;
}

export const CreationHubModal: React.FC<CreationHubModalProps> = ({
  isOpen,
  language,
  onClose,
  onSelectFeature,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const tools = [
    {
      id: "text_to_video" as AppTab,
      title: t.textToVideoTitle,
      desc: t.textToVideoDesc,
      icon: Video,
      color: "from-rose-500 to-red-600",
      cost: "15",
      badge: "Popular",
    },
    {
      id: "cartoon_story" as AppTab,
      title: t.cartoonStoryTitle,
      desc: t.cartoonStoryDesc,
      icon: Smile,
      color: "from-amber-500 to-orange-600",
      cost: "25",
      badge: "New ✨",
    },
    {
      id: "image_to_video" as AppTab,
      title: t.imageToVideoTitle,
      desc: t.imageToVideoDesc,
      icon: Wand2,
      color: "from-purple-500 to-indigo-600",
      cost: "12",
    },
    {
      id: "image_gen" as AppTab,
      title: t.imageGenTitle,
      desc: t.imageGenDesc,
      icon: ImageIcon,
      color: "from-emerald-500 to-teal-600",
      cost: "2",
    },
    {
      id: "voice_tts" as AppTab,
      title: t.voiceTtsTitle,
      desc: t.voiceTtsDesc,
      icon: Mic,
      color: "from-blue-500 to-cyan-600",
      cost: "4",
    },
    {
      id: "templates" as AppTab,
      title: t.templatesTitle,
      desc: t.templatesDesc,
      icon: LayoutTemplate,
      color: "from-pink-500 to-rose-600",
      cost: "Free to Browse",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              {language === "hi" ? "नया AI प्रोजेक्ट बनाएं" : "Create New AI Project"}
            </h2>
            <p className="text-xs text-neutral-400">
              {language === "hi" ? "अपना पसंदीदा AI टूल चुनें" : "Select an AI creation studio tool"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-4 overflow-y-auto no-scrollbar">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectFeature(tool.id);
                  onClose();
                }}
                className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 hover:border-neutral-600 transition text-left group relative"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} p-0.5 flex-shrink-0 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate group-hover:text-rose-400 transition">
                      {tool.title}
                    </span>
                    {tool.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                    {tool.desc}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-amber-400/90">
                    <Zap className="w-3 h-3 fill-amber-400" />
                    <span>{tool.cost} {tool.cost !== "Free to Browse" ? "Credits" : ""}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-neutral-800/80 text-center">
          <p className="text-[11px] text-neutral-500">
            {t.monetizationNotice}
          </p>
        </div>
      </div>
    </div>
  );
};

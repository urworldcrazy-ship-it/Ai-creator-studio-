import React from "react";
import { Home, Plus, Film, Bot, FolderHeart, ShieldCheck } from "lucide-react";
import { AppTab, Language } from "../types";
import { translations } from "../data/translations";

interface BottomNavProps {
  currentTab: AppTab;
  language: Language;
  onSelectTab: (tab: AppTab) => void;
  onOpenCreateHub: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  language,
  onSelectTab,
  onOpenCreateHub,
}) => {
  const t = translations[language];

  return (
    <nav className="sticky bottom-0 z-30 w-full bg-neutral-900/95 dark:bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-1.5 transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Home */}
        <button
          onClick={() => onSelectTab("home")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "home"
              ? "text-rose-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === "home" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t.home}</span>
        </button>

        {/* Video Editor */}
        <button
          onClick={() => onSelectTab("video_editor")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "video_editor"
              ? "text-rose-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Film className={`w-5 h-5 ${currentTab === "video_editor" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t.editor}</span>
        </button>

        {/* Big Glow Create Button */}
        <button
          onClick={onOpenCreateHub}
          className="relative -top-3 group flex items-center justify-center focus:outline-none"
          title={t.create}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
        </button>

        {/* AI Strategist Chatbot */}
        <button
          onClick={() => onSelectTab("assistant")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "assistant"
              ? "text-rose-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Bot className={`w-5 h-5 ${currentTab === "assistant" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t.assistant}</span>
        </button>

        {/* Projects / History */}
        <button
          onClick={() => onSelectTab("history")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "history"
              ? "text-rose-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <FolderHeart className={`w-5 h-5 ${currentTab === "history" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t.history}</span>
        </button>
      </div>
    </nav>
  );
};

import React from "react";
import { Sparkles, Moon, Sun, Smartphone, Monitor, Zap, Plus, Globe } from "lucide-react";
import { Language, Theme, UserAccount } from "../types";
import { translations } from "../data/translations";

interface HeaderProps {
  user: UserAccount;
  language: Language;
  theme: Theme;
  isMobileSimulator: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onToggleSimulator: () => void;
  onOpenCreditsModal: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  language,
  theme,
  isMobileSimulator,
  onToggleTheme,
  onToggleLanguage,
  onToggleSimulator,
  onOpenCreditsModal,
  onOpenProfile,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-900/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-rose-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              CreatorAI
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Studio
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Simulator Toggle (Desktop only helper) */}
          <button
            onClick={onToggleSimulator}
            title={isMobileSimulator ? t.fullViewToggle : t.mobileViewToggle}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition"
          >
            {isMobileSimulator ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t.fullViewToggle}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.mobileViewToggle}</span>
              </>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            title={t.switchLanguage}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-neutral-800/70 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-200 transition"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === "en" ? "HI" : "EN"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={t.themeToggle}
            className="p-1.5 rounded-lg bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 transition"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Credits Counter Pill */}
          <button
            onClick={onOpenCreditsModal}
            className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:border-amber-400 transition group shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{user.credits}</span>
            <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 ml-0.5">
              <Plus className="w-2.5 h-2.5" />
            </div>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="relative p-0.5 rounded-full border border-neutral-700 hover:border-rose-400 transition"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            {user.plan !== "free" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-neutral-900" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

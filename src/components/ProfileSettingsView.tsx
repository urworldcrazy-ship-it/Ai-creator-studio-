import React from "react";
import { 
  User, Shield, Zap, Globe, Moon, Sun, Smartphone, 
  ExternalLink, LogOut, CheckCircle2, Award, Heart, HelpCircle 
} from "lucide-react";
import { Language, Theme, UserAccount, AppTab } from "../types";
import { translations } from "../data/translations";

interface ProfileSettingsViewProps {
  user: UserAccount;
  language: Language;
  theme: Theme;
  isMobileSimulator: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onToggleSimulator: () => void;
  onOpenCreditsModal: () => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  user,
  language,
  theme,
  isMobileSimulator,
  onToggleTheme,
  onToggleLanguage,
  onToggleSimulator,
  onOpenCreditsModal,
  onNavigateTab,
}) => {
  const t = translations[language];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* User Card */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500 shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold uppercase shadow">
            {user.plan.replace("_", " ")}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white font-display">
            {user.name}
          </h2>
          <p className="text-xs text-neutral-400 truncate">
            {user.email}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user.credits} AI Credits</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
              {user.totalGenerated} Videos Rendered
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCreditsModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition"
        >
          {language === "hi" ? "प्लान अपग्रेड करें" : "Upgrade Plan"}
        </button>
      </div>

      {/* App Preferences */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
          {language === "hi" ? "ऐप सेटिंग्स और प्राथमिकताएं" : "App Preferences & Environment"}
        </h3>

        {/* Language */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-xs font-semibold text-white block">
                {language === "hi" ? "भाषा (Language)" : "Language"}
              </span>
              <span className="text-[11px] text-neutral-400">
                {language === "hi" ? "हिंदी (Hindi)" : "English (US)"}
              </span>
            </div>
          </div>
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
          >
            {language === "hi" ? "Switch to English" : "हिंदी में बदलें"}
          </button>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <span className="text-xs font-semibold text-white block">
                {language === "hi" ? "थीम (Dark / Light)" : "Visual Theme"}
              </span>
              <span className="text-[11px] text-neutral-400 capitalize">
                {theme} Mode
              </span>
            </div>
          </div>
          <button
            onClick={onToggleTheme}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Mobile Simulator */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-rose-400" />
            <div>
              <span className="text-xs font-semibold text-white block">
                {language === "hi" ? "मोबाइल फोन फ्रेम सिमुलेटर" : "Mobile Phone Frame Mockup"}
              </span>
              <span className="text-[11px] text-neutral-400">
                {isMobileSimulator ? "iPhone/Android 390px Shell Active" : "Full Desktop Responsive Canvas"}
              </span>
            </div>
          </div>
          <button
            onClick={onToggleSimulator}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
          >
            {isMobileSimulator ? "Exit Frame" : "Enable Frame"}
          </button>
        </div>
      </div>

      {/* Admin Panel Quick Access */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Admin Console & System Monitoring
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("admin")}
            className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-semibold transition"
          >
            Open Admin Panel
          </button>
        </div>
        <p className="text-xs text-neutral-400">
          View cluster metrics, GPU render jobs queue, user credit grant engine, and real-time server health.
        </p>
      </div>
    </div>
  );
};

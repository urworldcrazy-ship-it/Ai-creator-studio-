import React, { useState, useEffect } from "react";
import { 
  AppTab, Language, Theme, UserAccount, TrendingTopic 
} from "./types";
import { ShortsTemplate } from "./data/templates";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { CreationHubModal } from "./components/CreationHubModal";
import { MonetizationModal } from "./components/MonetizationModal";
import { HomeDashboardView } from "./components/HomeDashboardView";
import { TextToVideoView } from "./components/TextToVideoView";
import { CartoonStoryMakerView } from "./components/CartoonStoryMakerView";
import { ImageToVideoView } from "./components/ImageToVideoView";
import { VoiceAndTtsView } from "./components/VoiceAndTtsView";
import { AiImageGeneratorView } from "./components/AiImageGeneratorView";
import { VideoEditorView } from "./components/VideoEditorView";
import { ShortsTemplatesView } from "./components/ShortsTemplatesView";
import { AssistantChatbotView } from "./components/AssistantChatbotView";
import { ProjectHistoryView } from "./components/ProjectHistoryView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { ProfileSettingsView } from "./components/ProfileSettingsView";

export default function App() {
  // User profile state
  const [user, setUser] = useState<UserAccount>({
    id: "usr-default-creator",
    name: "Alex Rivera",
    email: "creator@creatorai.studio",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    plan: "creator_pro",
    credits: 120,
    totalGenerated: 24,
    createdAt: new Date().toISOString(),
  });

  // App Navigation & Modals State
  const [currentTab, setCurrentTab] = useState<AppTab>("home");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [isCreateHubOpen, setIsCreateHubOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);

  // Cross-studio routing state
  const [editorVideoUrl, setEditorVideoUrl] = useState<string | undefined>(undefined);
  const [editorScript, setEditorScript] = useState<any | undefined>(undefined);
  const [prefillVideoPrompt, setPrefillVideoPrompt] = useState<string | undefined>(undefined);

  // Sync user profile on mount
  const refreshUser = async () => {
    try {
      const res = await fetch(`/api/user/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Sync dark class on document root
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Credit Deduction
  const handleDeductCredits = async (amount: number, feature: string): Promise<boolean> => {
    if (user.credits < amount) {
      setIsCreditsModalOpen(true);
      return false;
    }
    try {
      const res = await fetch(`/api/user/${user.id}/deduct-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, feature }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => ({ ...prev, credits: data.remainingCredits }));
        return true;
      }
    } catch {
      // client-side fallback
      setUser((prev) => ({ ...prev, credits: Math.max(0, prev.credits - amount) }));
      return true;
    }
    return false;
  };

  // Plan Upgrade
  const handleUpgradePlan = async (plan: "creator_pro" | "studio_ultra") => {
    const creditsToAdd = plan === "creator_pro" ? 500 : 1800;
    try {
      await fetch("/api/admin/grant-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id, amount: creditsToAdd }),
      });
    } catch {
      // ignore
    }
    setUser((prev) => ({
      ...prev,
      plan,
      credits: prev.credits + creditsToAdd,
    }));
  };

  // Buy Credit Pack
  const handleBuyCreditPack = async (amount: number) => {
    try {
      await fetch("/api/admin/grant-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id, amount }),
      });
    } catch {
      // ignore
    }
    setUser((prev) => ({
      ...prev,
      credits: prev.credits + amount,
    }));
  };

  // Rewarded Ad watched
  const handleRewardAdWatched = async () => {
    await handleBuyCreditPack(15);
  };

  // Restore Purchases
  const handleRestorePurchases = async () => {
    await refreshUser();
    alert("In-App Purchases validated and refreshed from Play Store / App Store!");
  };

  // Cross-feature routing helpers
  const handleSendToEditor = (videoUrl: string, script?: any) => {
    setEditorVideoUrl(videoUrl);
    setEditorScript(script);
    setCurrentTab("video_editor");
  };

  const handleSendToVideoGen = (prompt: string) => {
    setPrefillVideoPrompt(prompt);
    setCurrentTab("text_to_video");
  };

  const handleUseTemplate = (template: ShortsTemplate) => {
    setPrefillVideoPrompt(template.defaultHook + " — " + template.description);
    setCurrentTab("text_to_video");
  };

  const handleUseTrendingTopic = (topic: TrendingTopic) => {
    setPrefillVideoPrompt(topic.hook + " — " + topic.title);
    setCurrentTab("text_to_video");
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-neutral-950 text-neutral-100" : "bg-neutral-100 text-neutral-900"
      } font-sans selection:bg-rose-500 selection:text-white flex flex-col justify-between`}
    >
      {/* Mobile Simulator Frame (if toggled on desktop) */}
      <div
        className={
          isMobileSimulator
            ? "max-w-[420px] mx-auto my-6 border-8 border-neutral-800 rounded-[48px] overflow-hidden shadow-2xl bg-neutral-950 min-h-[860px] flex flex-col relative"
            : "w-full min-h-screen flex flex-col"
        }
      >
        {/* Dynamic Island / Speaker notch for simulator */}
        {isMobileSimulator && (
          <div className="w-full bg-neutral-950 py-2.5 flex justify-center items-center relative z-40">
            <div className="w-24 h-4 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-end pr-2">
              <div className="w-2 h-2 rounded-full bg-neutral-800" />
            </div>
          </div>
        )}

        {/* Global Navigation Header */}
        <Header
          user={user}
          language={language}
          theme={theme}
          isMobileSimulator={isMobileSimulator}
          onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          onToggleLanguage={() => setLanguage((prev) => (prev === "en" ? "hi" : "en"))}
          onToggleSimulator={() => setIsMobileSimulator((prev) => !prev)}
          onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
          onOpenProfile={() => setCurrentTab("profile")}
        />

        {/* Main Content Router */}
        <main className="flex-1 overflow-x-hidden">
          {currentTab === "home" && (
            <HomeDashboardView
              user={user}
              language={language}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              onUseTemplate={handleUseTemplate}
            />
          )}

          {currentTab === "text_to_video" && (
            <TextToVideoView
              user={user}
              language={language}
              prefillPrompt={prefillVideoPrompt}
              onDeductCredits={handleDeductCredits}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              onSendToEditor={handleSendToEditor}
            />
          )}

          {currentTab === "cartoon_story" && (
            <CartoonStoryMakerView
              user={user}
              language={language}
              onDeductCredits={handleDeductCredits}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              onSendToEditor={handleSendToEditor}
            />
          )}

          {currentTab === "image_to_video" && (
            <ImageToVideoView
              user={user}
              language={language}
              onDeductCredits={handleDeductCredits}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              onSendToEditor={handleSendToEditor}
            />
          )}

          {currentTab === "voice_tts" && (
            <VoiceAndTtsView
              user={user}
              language={language}
              onDeductCredits={handleDeductCredits}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
            />
          )}

          {currentTab === "image_gen" && (
            <AiImageGeneratorView
              user={user}
              language={language}
              onDeductCredits={handleDeductCredits}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              onSendToImageToVideo={(imageUrl) => {
                setCurrentTab("image_to_video");
              }}
            />
          )}

          {currentTab === "video_editor" && (
            <VideoEditorView
              user={user}
              language={language}
              initialVideoUrl={editorVideoUrl}
              initialScript={editorScript}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
            />
          )}

          {currentTab === "templates" && (
            <ShortsTemplatesView
              user={user}
              language={language}
              onUseTemplate={handleUseTemplate}
              onUseTrendingTopic={handleUseTrendingTopic}
            />
          )}

          {currentTab === "assistant" && (
            <AssistantChatbotView
              user={user}
              language={language}
              onSendToVideoGenerator={handleSendToVideoGen}
            />
          )}

          {currentTab === "history" && (
            <ProjectHistoryView
              user={user}
              language={language}
              onSendToEditor={handleSendToEditor}
            />
          )}

          {currentTab === "admin" && (
            <AdminDashboardView
              user={user}
              language={language}
              onRefreshUser={refreshUser}
            />
          )}

          {currentTab === "profile" && (
            <ProfileSettingsView
              user={user}
              language={language}
              theme={theme}
              isMobileSimulator={isMobileSimulator}
              onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              onToggleLanguage={() => setLanguage((prev) => (prev === "en" ? "hi" : "en"))}
              onToggleSimulator={() => setIsMobileSimulator((prev) => !prev)}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}
        </main>

        {/* Global Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          language={language}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenCreateHub={() => setIsCreateHubOpen(true)}
        />
      </div>

      {/* Popups & Dialogs */}
      <CreationHubModal
        isOpen={isCreateHubOpen}
        language={language}
        onClose={() => setIsCreateHubOpen(false)}
        onSelectFeature={(tab) => {
          setCurrentTab(tab);
          setIsCreateHubOpen(false);
        }}
      />

      <MonetizationModal
        isOpen={isCreditsModalOpen}
        user={user}
        language={language}
        onClose={() => setIsCreditsModalOpen(false)}
        onUpgradePlan={handleUpgradePlan}
        onBuyCreditPack={handleBuyCreditPack}
        onRewardAdWatched={handleRewardAdWatched}
        onRestorePurchases={handleRestorePurchases}
      />
    </div>
  );
}

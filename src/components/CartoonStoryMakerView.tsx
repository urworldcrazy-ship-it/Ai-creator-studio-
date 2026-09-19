import React, { useState } from "react";
import { 
  Smile, Sparkles, Wand2, Play, Pause, Download, Volume2, 
  Layers, UserPlus, CheckCircle2, AlertCircle, Clock, ChevronRight, Film
} from "lucide-react";
import { Language, UserAccount, GenerationJob } from "../types";
import { translations } from "../data/translations";

interface CartoonStoryMakerViewProps {
  user: UserAccount;
  language: Language;
  onDeductCredits: (amount: number, feature: string) => Promise<boolean>;
  onOpenCreditsModal: () => void;
  onSendToEditor: (videoUrl: string, script?: any) => void;
}

export const CartoonStoryMakerView: React.FC<CartoonStoryMakerViewProps> = ({
  user,
  language,
  onDeductCredits,
  onOpenCreditsModal,
  onSendToEditor,
}) => {
  const t = translations[language];

  // Story state
  const [prompt, setPrompt] = useState(
    language === "hi"
      ? "एक नटखट बंदर और एक जादुई उड़ने वाली छड़ी की मजेदार कहानी जो बादलों में छुपे आम के बाग में ले जाती है"
      : "A brave little red panda and a flying robotic bumblebee exploring an ancient candy cloud kingdom"
  );
  const [artStyle, setArtStyle] = useState("3D Pixar Disney");
  const [targetAudience, setTargetAudience] = useState("Kids & Family (Viral Shorts)");
  const [characterLead, setCharacterLead] = useState("Golu the Red Panda");

  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyData, setStoryData] = useState<any | null>(null);
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const artStyles = [
    "3D Pixar Disney",
    "Studio Ghibli 2D",
    "Chibi 3D Claymation",
    "Comic Book Manga",
    "Vintage Cartoon 1930s",
  ];

  const presets = language === "hi"
    ? [
        "चिंटू और समय में सफर करने वाली जादुई केतली",
        "जंगल का राजा शेर जब एक चूहे से हार गया",
        "चांद पर रहने वाली नन्हीं परी और उसका उड़ता हुआ खरगोश",
      ]
    : [
        "Chintu and the time-traveling spiced tea kettle",
        "The clumsy baby dragon who breathed bubbles instead of fire",
        "Space Hamster's great escape from the cat galaxy",
      ];

  // Generate Story Scenes
  const handleGenerateStory = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/cartoon-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          artStyle,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStoryData(data);
        setCurrentSceneIdx(0);
      } else {
        setErrorMsg(data.error || "Failed to generate story");
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render Full Animated Video
  const handleRenderCartoonVideo = async () => {
    if (user.credits < 25) {
      onOpenCreditsModal();
      return;
    }

    setIsRenderingVideo(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: "cartoon_story",
          title: storyData?.title || "Cartoon Animated Story",
          prompt,
          aspectRatio: "9:16",
          duration: 15,
          resultData: {
            story: storyData,
            artStyle,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) onOpenCreditsModal();
        setErrorMsg(data.error || "Failed to render video");
        setIsRenderingVideo(false);
        return;
      }

      setActiveJob(data.job);

      const poll = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/jobs/${data.job.id}/status`);
          if (pollRes.ok) {
            const updated = await pollRes.json();
            setActiveJob(updated);
            if (updated.status === "completed" || updated.status === "failed") {
              clearInterval(poll);
              setIsRenderingVideo(false);
            }
          }
        } catch {
          // ignore
        }
      }, 1000);
    } catch (err: any) {
      setErrorMsg("Error rendering cartoon: " + err.message);
      setIsRenderingVideo(false);
    }
  };

  // Voice narration speech simulation using browser Web Speech API
  const handleSpeakNarration = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 1.05;
    utterance.pitch = 1.15; // Cheerful cartoon voice
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <Smile className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {t.cartoonStoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t.cartoonStoryDesc}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Creation Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              {language === "hi" ? "कहानी का विचार / प्लॉट" : "Cartoon Story Idea / Character Plot"}
            </label>
            <span className="text-[10px] text-amber-400 font-medium">
              Cost: 25 Credits
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none transition resize-none leading-relaxed"
          />
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {language === "hi" ? "कहानी के सुझाव:" : "Inspirational Story Concepts:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition truncate max-w-full text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Art Style & Characters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "एनिमेशन शैली (Art Style)" : "Animation Style"}
            </label>
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
            >
              {artStyles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "मुख्य पात्र (Lead Character)" : "Main Character Name"}
            </label>
            <input
              type="text"
              value={characterLead}
              onChange={(e) => setCharacterLead(e.target.value)}
              placeholder="e.g. Sparky the Copper Bot"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleGenerateStory}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 text-amber-400 ${isGenerating ? "animate-spin" : ""}`} />
            <span>
              {isGenerating
                ? language === "hi" ? "कहानी बुनी जा रही है..." : "Writing Storyboard..."
                : language === "hi" ? "1. 3D स्टोरीबोर्ड और संवाद बनाएं" : "1. Generate Storyboard & Script"}
            </span>
          </button>

          <button
            onClick={handleRenderCartoonVideo}
            disabled={isRenderingVideo || !prompt.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isRenderingVideo ? "animate-spin" : ""}`} />
            <span>
              {isRenderingVideo
                ? language === "hi" ? "कार्टून रेंडर हो रहा है..." : "Rendering 3D Cartoon..."
                : language === "hi" ? "2. एनिमेटेड वीडियो रेंडर करें (25 क.)" : "2. Render 3D Video (25 Cr)"}
            </span>
          </button>
        </div>
      </div>

      {/* Storyboard Interactive Comic Deck */}
      {storyData && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white">
                {storyData.title}
              </h3>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                Moral: {storyData.moral}
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {storyData.artStyle}
            </span>
          </div>

          {/* Scene Carousel Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {storyData.scenes.map((sc: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSceneIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  currentSceneIdx === idx
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                Scene {sc.sceneNumber || idx + 1}: {sc.title || `Shot ${idx + 1}`}
              </button>
            ))}
          </div>

          {/* Active Scene Comic Card Preview */}
          {storyData.scenes[currentSceneIdx] && (
            <div className={`rounded-2xl p-5 bg-gradient-to-br ${storyData.scenes[currentSceneIdx].bgGradient || "from-amber-900/50 via-purple-900/40 to-neutral-950"} border border-neutral-700 shadow-xl space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Scene #{storyData.scenes[currentSceneIdx].sceneNumber} — {storyData.scenes[currentSceneIdx].title}
                </span>
                <span className="text-[11px] text-neutral-300 font-mono">
                  {storyData.scenes[currentSceneIdx].duration || 4}s Duration
                </span>
              </div>

              {/* Visual Prompt */}
              <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider">
                  Visual Direction:
                </span>
                <p className="text-xs text-neutral-100 leading-relaxed">
                  {storyData.scenes[currentSceneIdx].visualPrompt}
                </p>
              </div>

              {/* Spoken Dialogue & Narration */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      Character Dialogue:
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      "{storyData.scenes[currentSceneIdx].dialogue}"
                    </p>
                    <p className="text-xs text-neutral-300 mt-1 italic">
                      Narration: {storyData.scenes[currentSceneIdx].narration}
                    </p>
                  </div>
                  
                  {/* Listen Voiceover */}
                  <button
                    onClick={() => handleSpeakNarration(storyData.scenes[currentSceneIdx].dialogue + ". " + storyData.scenes[currentSceneIdx].narration)}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                    title="Play voiceover preview"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingAudio ? "Stop" : "Listen"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render Queue & Video Player */}
      {activeJob && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeJob.status === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400 animate-spin" />
              )}
              <h3 className="font-bold text-sm text-white">
                {activeJob.title}
              </h3>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                activeJob.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {activeJob.status} ({activeJob.progress}%)
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 italic">
              {activeJob.stageMessage}
            </p>
          </div>

          {activeJob.status === "completed" && activeJob.resultUrl && (
            <div className="pt-2 space-y-3">
              <div className="relative aspect-[9/16] max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black border border-neutral-700 shadow-2xl">
                <video
                  src={activeJob.resultUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  autoPlay
                />
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-amber-400 font-bold">
                  3D Cartoon HD
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={activeJob.resultUrl}
                  download="cartoon_animation.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-700"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.download}</span>
                </a>

                <button
                  onClick={() => onSendToEditor(activeJob.resultUrl!, storyData)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "एडिटर में कैप्शन जोड़ें" : "Add Captions in Editor"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

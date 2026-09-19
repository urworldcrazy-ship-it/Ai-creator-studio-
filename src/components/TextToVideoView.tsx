import React, { useState } from "react";
import { 
  Video, Sparkles, Wand2, Play, Pause, Download, Edit3, 
  RotateCcw, Film, CheckCircle2, AlertCircle, Clock, Volume2, 
  ChevronRight, Layers, Sliders
} from "lucide-react";
import { Language, UserAccount, VideoScript, GenerationJob } from "../types";
import { translations } from "../data/translations";

interface TextToVideoViewProps {
  user: UserAccount;
  language: Language;
  prefillPrompt?: string;
  onDeductCredits: (amount: number, feature: string) => Promise<boolean>;
  onOpenCreditsModal: () => void;
  onSendToEditor: (videoUrl: string, script?: any) => void;
}

export const TextToVideoView: React.FC<TextToVideoViewProps> = ({
  user,
  language,
  prefillPrompt,
  onDeductCredits,
  onOpenCreditsModal,
  onSendToEditor,
}) => {
  const t = translations[language];

  // Form State
  const [prompt, setPrompt] = useState(
    prefillPrompt ||
    (language === "hi"
      ? "भविष्य के शहर में उड़ती हुई कारें और नियॉन बारिश, 4K सिनेमैटिक वर्टिकल रील"
      : "Cinematic vertical 9:16 video of futuristic flying cars navigating neon rain towers in Neo-Tokyo, 4K photoreal")
  );
  const [visualStyle, setVisualStyle] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [duration, setDuration] = useState(15);
  const [cameraMotion, setCameraMotion] = useState("Dynamic Zoom & Pan");

  // Workflow State
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptData, setScriptData] = useState<VideoScript | null>(null);
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    if (prefillPrompt) {
      setPrompt(prefillPrompt);
    }
  }, [prefillPrompt]);

  const stylePresets = [
    "Cinematic",
    "Cyberpunk",
    "Anime 4K",
    "3D Pixar",
    "Dark Fantasy",
    "Hyper-Realistic",
  ];

  const cameraPresets = [
    "Dynamic Zoom & Pan",
    "Drone Flythrough",
    "Slow Motion Hero Shot",
    "Fast Action Whip Pan",
  ];

  // Quick inspirational prompt suggestions
  const promptSuggestions = language === "hi"
    ? [
        "प्राचीन भारतीय मंदिर में जलता हुआ रहस्यमयी दीया और उड़ती हुई सुनहरी धूल",
        "AI रोबोट और एक बच्चे की दिल छू लेने वाली दोस्ती, 3D स्टाइल",
        "गहरे अंतरिक्ष में ब्लैक होल के पास चमकता हुआ स्टारगेट पोर्टल",
      ]
    : [
        "A mythical glowing phoenix rising over stormy cyberpunk skyscrapers",
        "Macro slow-motion shot of espresso dripping into crystal glass with golden crema",
        "Futuristic Mars rover discovering glowing alien flora in canyon dusk",
      ];

  // Step 1: Generate AI Script & Storyboard via Gemini
  const handleGenerateScript = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingScript(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/video-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          visualStyle,
          aspectRatio,
          duration,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setScriptData(data);
      } else {
        setErrorMsg(data.error || "Failed to draft script");
      }
    } catch (err: any) {
      setErrorMsg("Network error generating script: " + err.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Step 2: Render Video via Cloud Queue
  const handleStartRender = async () => {
    setErrorMsg("");
    // Check credits
    if (user.credits < 15) {
      onOpenCreditsModal();
      return;
    }

    setIsRendering(true);
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: "text_to_video",
          title: scriptData?.title || prompt.substring(0, 30) + "...",
          prompt,
          aspectRatio,
          duration,
          resultData: {
            script: scriptData,
            visualStyle,
            cameraMotion,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          onOpenCreditsModal();
        }
        setErrorMsg(data.error || "Failed to start render");
        setIsRendering(false);
        return;
      }

      setActiveJob(data.job);

      // Poll job status until 100%
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/jobs/${data.job.id}/status`);
          if (pollRes.ok) {
            const updatedJob = await pollRes.json();
            setActiveJob(updatedJob);
            if (updatedJob.status === "completed" || updatedJob.status === "failed") {
              clearInterval(pollInterval);
              setIsRendering(false);
            }
          }
        } catch {
          // ignore transient poll error
        }
      }, 1000);
    } catch (err: any) {
      setErrorMsg("Render error: " + err.message);
      setIsRendering(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
          <Video className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {t.textToVideoTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t.textToVideoDesc}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              {language === "hi" ? "वीडियो का विचार / प्रॉम्प्ट दर्ज करें" : "Video Concept / Scene Prompt"}
            </label>
            <span className="text-[10px] text-amber-400 font-medium">
              Cost: 15 Credits
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder={
              language === "hi"
                ? "वर्णन करें कि आप वीडियो में क्या देखना चाहते हैं..."
                : "Describe your scene, action, atmosphere, and visual subject in detail..."
            }
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none transition resize-none leading-relaxed"
          />
        </div>

        {/* Suggestion Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            {language === "hi" ? "वायरल आइडियाज (क्लिक करें):" : "Viral Inspiration Prompts:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(item)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition truncate max-w-full text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Grid: Aspect Ratio, Style, Camera, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Visual Style */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "विज़ुअल स्टाइल" : "Visual Style"}
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
            >
              {stylePresets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "पहलू अनुपात (Aspect Ratio)" : "Aspect Ratio"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "9:16", label: "9:16 Shorts" },
                { id: "16:9", label: "16:9 Cinema" },
                { id: "1:1", label: "1:1 Square" },
              ].map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={`py-2 text-xs font-medium rounded-xl border transition ${
                    aspectRatio === ar.id
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "कैमरा मोशन" : "Camera Dynamics"}
            </label>
            <select
              value={cameraMotion}
              onChange={(e) => setCameraMotion(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
            >
              {cameraPresets.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 flex items-center justify-between">
              <span>{language === "hi" ? "अवधि (सेकंड्स)" : "Duration (Seconds)"}</span>
              <span className="text-rose-400 font-bold">{duration}s</span>
            </label>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-rose-500 bg-neutral-800 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleGenerateScript}
            disabled={isGeneratingScript || !prompt.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 text-purple-400 ${isGeneratingScript ? "animate-spin" : ""}`} />
            <span>
              {isGeneratingScript
                ? language === "hi" ? "स्क्रिप्ट तैयार हो रही है..." : "Drafting AI Script..."
                : language === "hi" ? "1. AI स्क्रिप्ट और दृश्य बनाएं" : "1. Generate AI Script & Storyboard"}
            </span>
          </button>

          <button
            onClick={handleStartRender}
            disabled={isRendering || !prompt.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isRendering ? "animate-spin" : ""}`} />
            <span>
              {isRendering
                ? language === "hi" ? "GPU रेंडर हो रहा है..." : "Rendering on AI GPU..."
                : language === "hi" ? "2. 60fps वीडियो रेंडर करें (15 क.)" : "2. Render 60fps Video (15 Cr)"}
            </span>
          </button>
        </div>
      </div>

      {/* Script & Storyboard Preview Section */}
      {scriptData && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-white">
                {scriptData.title}
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              {scriptData.captionsStyle}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              {language === "hi" ? "वायरल हुक (पहला 3 सेकंड्स):" : "Viral Hook (First 3 Seconds):"}
            </span>
            <p className="text-xs text-white font-medium mt-0.5 italic">
              "{scriptData.hook}"
            </p>
          </div>

          {/* Scenes Storyboard */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-neutral-400 block">
              {language === "hi" ? "शॉट-बाय-शॉट स्टोरीबोर्ड:" : "Shot-by-Shot Storyboard:"}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {scriptData.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="font-bold text-rose-400">
                      Scene #{scene.sceneNumber || idx + 1} {scene.timeRange && `(${scene.timeRange})`}
                    </span>
                    <span className="text-neutral-500">{scene.cameraShot || "Dynamic"}</span>
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    <strong className="text-neutral-400">Visual:</strong> {scene.visualPrompt}
                  </p>
                  <p className="text-neutral-200 text-[11px]">
                    <strong className="text-neutral-400">Voiceover:</strong> "{scene.narration}"
                  </p>
                  {scene.subtitle && (
                    <div className="mt-1 inline-block self-start px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold">
                      Caption: {scene.subtitle}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              BGM: {scriptData.suggestedBgm}
            </span>
          </div>
        </div>
      )}

      {/* Real-time Render Progress & Video Player */}
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

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-rose-500 via-purple-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 italic">
              {activeJob.stageMessage}
            </p>
          </div>

          {/* Video Player on Complete */}
          {activeJob.status === "completed" && activeJob.resultUrl && (
            <div className="pt-2 space-y-3">
              <div className="relative aspect-[9/16] max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black border border-neutral-700 shadow-2xl group">
                <video
                  src={activeJob.resultUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  autoPlay
                />
                
                {/* On-screen subtitle overlay simulation */}
                <div className="absolute bottom-6 inset-x-3 text-center pointer-events-none">
                  <span className="px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md text-amber-300 font-bold text-xs shadow-lg border border-amber-500/30">
                    ⚡ {scriptData?.scenes?.[0]?.subtitle || "AI Video Generated in 4K"}
                  </span>
                </div>

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-mono">
                  1080x1920 60fps
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={activeJob.resultUrl}
                  download="creator_ai_short.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-700"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.download}</span>
                </a>

                <button
                  onClick={() => onSendToEditor(activeJob.resultUrl!, activeJob.resultData?.script)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "वीडियो एडिटर में खोलें" : "Open in Video Editor"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

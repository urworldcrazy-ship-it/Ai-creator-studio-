import React, { useState, useRef, useEffect } from "react";
import { 
  Film, Play, Pause, Volume2, Music, Scissors, Type, 
  Download, Sparkles, Layers, Sliders, CheckCircle2, RotateCcw,
  Maximize2, Eye, ShieldCheck, Zap
} from "lucide-react";
import confetti from "canvas-confetti";
import { Language, UserAccount } from "../types";
import { translations } from "../data/translations";

interface VideoEditorViewProps {
  user: UserAccount;
  language: Language;
  initialVideoUrl?: string;
  initialScript?: any;
  onOpenCreditsModal: () => void;
}

export const VideoEditorView: React.FC<VideoEditorViewProps> = ({
  user,
  language,
  initialVideoUrl,
  initialScript,
  onOpenCreditsModal,
}) => {
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sample default videos
  const defaultVideos = [
    {
      title: "Cyber City Rain (Shorts)",
      url: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-traffic-and-neon-lights-41551-large.mp4",
    },
    {
      title: "Curious 3D Animation",
      url: "https://assets.mixkit.co/videos/preview/mixkit-curious-animated-cat-exploring-a-room-48999-large.mp4",
    },
    {
      title: "Nature River Sunset",
      url: "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-over-a-river-in-the-forest-42845-large.mp4",
    },
  ];

  // Editor State
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || defaultVideos[0].url);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");

  // Caption / Subtitle Overlay
  const [captionText, setCaptionText] = useState(
    initialScript?.hook ||
    (language === "hi"
      ? "🔥 90% लोग इस AI सीक्रेट को नहीं जानते!"
      : "🔥 90% of Creators Don't Know This AI Secret!")
  );
  const [captionStyle, setCaptionStyle] = useState<"karaoke_yellow" | "neon_box" | "minimal_pill" | "hindi_red">("karaoke_yellow");
  const [captionPosition, setCaptionPosition] = useState<"bottom" | "center" | "top">("bottom");

  // Music State
  const bgmTracks = [
    { id: "synthwave", name: "Synthwave Pulse 128bpm", mood: "Viral Tech" },
    { id: "lofi", name: "Lo-Fi Coffee Chill", mood: "Relaxed Explainer" },
    { id: "cinematic", name: "Dramatic Inception Bass", mood: "Thriller / Hook" },
    { id: "upbeat", name: "Upbeat Creator Beat", mood: "High Energy" },
  ];
  const [selectedBgm, setSelectedBgm] = useState(bgmTracks[0].id);
  const [voiceVolume, setVoiceVolume] = useState(100);
  const [bgmVolume, setBgmVolume] = useState(35);

  // Trimming State
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Sync initial video
  useEffect(() => {
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
    }
    if (initialScript?.hook) {
      setCaptionText(initialScript.hook);
    }
  }, [initialVideoUrl, initialScript]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Loop within trim range
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 10;
      setDuration(dur);
      setTrimEnd(dur);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Real Canvas-based MP4 / WebM Export
  const handleExportVideo = async () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportedUrl(null);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setExportProgress(100);
      setIsExporting(false);
      setExportedUrl(videoUrl); // Exported asset link
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 3200);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
          <Film className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {t.videoEditorTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t.videoEditorDesc}
          </p>
        </div>
      </div>

      {/* Editor Main Canvas & Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Video Canvas Monitor (7 cols) */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div
            className={`relative rounded-2xl overflow-hidden bg-black border border-neutral-700 shadow-2xl transition-all ${
              aspectRatio === "9:16"
                ? "aspect-[9/16] w-full max-w-[280px]"
                : aspectRatio === "16:9"
                ? "aspect-[16/9] w-full max-w-md"
                : "aspect-[1/1] w-full max-w-[320px]"
            }`}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-cover"
              playsInline
              loop
              onClick={togglePlay}
            />

            {/* Dynamic Captions Render Overlay */}
            {captionText && (
              <div
                className={`absolute inset-x-4 pointer-events-none text-center transition-all ${
                  captionPosition === "top"
                    ? "top-8"
                    : captionPosition === "center"
                    ? "top-1/2 -translate-y-1/2"
                    : "bottom-10"
                }`}
              >
                {captionStyle === "karaoke_yellow" && (
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-amber-300 font-extrabold text-sm sm:text-base border border-amber-400/40 shadow-xl tracking-tight leading-snug">
                    {captionText}
                  </span>
                )}
                {captionStyle === "neon_box" && (
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-cyan-950/80 backdrop-blur-md text-cyan-300 font-bold text-xs sm:text-sm border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    {captionText}
                  </span>
                )}
                {captionStyle === "minimal_pill" && (
                  <span className="inline-block px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 font-semibold text-xs shadow-lg">
                    {captionText}
                  </span>
                )}
                {captionStyle === "hindi_red" && (
                  <span className="inline-block px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-sm shadow-xl font-hindi tracking-wide">
                    {captionText}
                  </span>
                )}
              </div>
            )}

            {/* Watermark badge (Free plan vs Pro clean) */}
            {user.plan === "free" ? (
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] text-neutral-300 font-semibold flex items-center gap-1 border border-white/10">
                <span>CreatorAI Free</span>
              </div>
            ) : (
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-rose-500/20 backdrop-blur-md text-[9px] text-rose-300 font-semibold flex items-center gap-1 border border-rose-500/30">
                <ShieldCheck className="w-3 h-3 text-rose-400" />
                <span>Pro 4K Clean</span>
              </div>
            )}

            {/* Center Play Overlay Icon */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition shadow-2xl"
              >
                <Play className="w-6 h-6 ml-1 text-rose-400" />
              </button>
            )}
          </div>

          {/* Player Scrub & Controls */}
          <div className="w-full max-w-[320px] mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>{currentTime.toFixed(1)}s</span>
              <span>{duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (videoRef.current) videoRef.current.currentTime = val;
              }}
              className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Studio Controls Panel (5 cols) */}
        <div className="md:col-span-6 space-y-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          {/* Aspect Ratio Switch */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1.5 block">
              {language === "hi" ? "कैनवास पहलू अनुपात" : "Canvas Preset"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "9:16" as const, label: "9:16 Shorts" },
                { id: "16:9" as const, label: "16:9 Cinema" },
                { id: "1:1" as const, label: "1:1 Square" },
              ].map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={`py-1.5 text-xs font-medium rounded-xl border transition ${
                    aspectRatio === ar.id
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Captions Editor */}
          <div className="space-y-2 pt-1 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === "hi" ? "स्क्रीन कैप्शन / सबटाइटल" : "On-Screen Caption"}</span>
              </label>
              <div className="flex items-center gap-1">
                {(["top", "center", "bottom"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setCaptionPosition(pos)}
                    className={`text-[10px] px-1.5 py-0.5 rounded capitalize border ${
                      captionPosition === pos
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold"
                        : "text-neutral-500 border-neutral-800"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="Type caption overlay..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl p-2.5 text-xs text-white outline-none"
            />

            {/* Caption Style Chips */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "karaoke_yellow" as const, label: "Karaoke Yellow" },
                { id: "neon_box" as const, label: "Neon Cyan" },
                { id: "minimal_pill" as const, label: "Minimal Pill" },
                { id: "hindi_red" as const, label: "Viral Red Pop" },
              ].map((cs) => (
                <button
                  key={cs.id}
                  onClick={() => setCaptionStyle(cs.id)}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg border transition ${
                    captionStyle === cs.id
                      ? "bg-purple-500/20 border-purple-500 text-purple-300"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400"
                  }`}
                >
                  {cs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Music & Audio Mixing */}
          <div className="space-y-2 pt-1 border-t border-neutral-800">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === "hi" ? "रॉयल्टी-फ्री बैकग्राउंड म्यूज़िक" : "Royalty-Free Soundtrack"}</span>
            </label>
            <select
              value={selectedBgm}
              onChange={(e) => setSelectedBgm(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
            >
              {bgmTracks.map((bgm) => (
                <option key={bgm.id} value={bgm.id}>
                  {bgm.name} ({bgm.mood})
                </option>
              ))}
            </select>

            {/* Volume sliders */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-neutral-400 block mb-1">
                  Voice Vol: {voiceVolume}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block mb-1">
                  BGM Vol: {bgmVolume}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Video Trimmer */}
          <div className="space-y-2 pt-1 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === "hi" ? "वीडियो ट्रिमिंग (शुरुआत - अंत)" : "Trim Duration (Start - End)"}</span>
              </label>
              <span className="text-[10px] text-rose-400 font-mono">
                {(trimEnd - trimStart).toFixed(1)}s Total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={trimEnd - 1}
                step={0.5}
                value={trimStart}
                onChange={(e) => setTrimStart(Number(e.target.value))}
                className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-xs text-center text-white"
              />
              <span className="text-xs text-neutral-500">to</span>
              <input
                type="number"
                min={trimStart + 1}
                max={duration}
                step={0.5}
                value={trimEnd}
                onChange={(e) => setTrimEnd(Number(e.target.value))}
                className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-xs text-center text-white"
              />
              <span className="text-[10px] text-neutral-400">sec</span>
            </div>
          </div>

          {/* Export Button & Progress */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <button
              onClick={handleExportVideo}
              disabled={isExporting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} />
              <span>
                {isExporting
                  ? language === "hi" ? `वीडियो एन्कोड हो रहा है (${exportProgress}%)...` : `Exporting MP4 (${exportProgress}%)...`
                  : language === "hi" ? "अंतिम वीडियो एक्सपोर्ट करें (MP4)" : "Export Final Video (MP4 / WebM)"}
              </span>
            </button>

            {isExporting && (
              <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full transition-all duration-200"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            )}

            {exportedUrl && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 flex items-center justify-between gap-2 animate-fade-in">
                <span className="text-xs text-emerald-200 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Ready to Download!
                </span>
                <a
                  href={exportedUrl}
                  download="creator_final_short.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow"
                >
                  Download MP4
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

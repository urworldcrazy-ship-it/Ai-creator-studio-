import React, { useState, useRef } from "react";
import { 
  Wand2, Upload, Sparkles, Play, Download, Edit3, 
  CheckCircle2, AlertCircle, Clock, Image as ImageIcon, RefreshCw
} from "lucide-react";
import { Language, UserAccount, GenerationJob } from "../types";
import { translations } from "../data/translations";

interface ImageToVideoViewProps {
  user: UserAccount;
  language: Language;
  onDeductCredits: (amount: number, feature: string) => Promise<boolean>;
  onOpenCreditsModal: () => void;
  onSendToEditor: (videoUrl: string) => void;
}

export const ImageToVideoView: React.FC<ImageToVideoViewProps> = ({
  user,
  language,
  onDeductCredits,
  onOpenCreditsModal,
  onSendToEditor,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample image gallery to pick from or upload
  const sampleImages = [
    {
      title: "Cyberpunk Girl in Rain",
      url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=720&auto=format&fit=crop&q=80",
    },
    {
      title: "Majestic Golden Lion",
      url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=720&auto=format&fit=crop&q=80",
    },
    {
      title: "Cosmic Nebula Nebula",
      url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=720&auto=format&fit=crop&q=80",
    },
    {
      title: "Futuristic Supercar",
      url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=720&auto=format&fit=crop&q=80",
    },
  ];

  const [selectedImage, setSelectedImage] = useState(sampleImages[0].url);
  const [motionPrompt, setMotionPrompt] = useState(
    language === "hi"
      ? "कैमरा धीरे-धीरे ज़ूम इन करे, बारिश की बूंदों में नियॉन रोशनी चमके और हवा में बाल लहराएं"
      : "Slow cinematic push-in, subtle breathing motion, neon rain particles falling softly with volumetric glow"
  );
  const [motionIntensity, setMotionIntensity] = useState("Medium (Cinematic Flow)");
  const [isRendering, setIsRendering] = useState(false);
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRenderVideo = async () => {
    if (user.credits < 12) {
      onOpenCreditsModal();
      return;
    }

    setIsRendering(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: "image_to_video",
          title: "Image Motion Video",
          prompt: motionPrompt,
          aspectRatio: "9:16",
          duration: 8,
          resultData: {
            sourceImage: selectedImage,
            motionIntensity,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) onOpenCreditsModal();
        setErrorMsg(data.error || "Failed to render video");
        setIsRendering(false);
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
              setIsRendering(false);
            }
          }
        } catch {
          // ignore
        }
      }, 1000);
    } catch (err: any) {
      setErrorMsg("Error: " + err.message);
      setIsRendering(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Wand2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {t.imageToVideoTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t.imageToVideoDesc}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Source Image Selection */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-2">
            {language === "hi" ? "1. स्त्रोत छवि चुनें या अपलोड करें" : "1. Select or Upload Source Image"}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {sampleImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img.url)}
                className={`relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition ${
                  selectedImage === img.url
                    ? "border-purple-500 shadow-md shadow-purple-500/30 scale-102"
                    : "border-neutral-800 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t from-black via-black/60 to-transparent text-[9px] text-white font-medium truncate">
                  {img.title}
                </span>
              </button>
            ))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl border border-dashed border-neutral-700 hover:border-purple-500 bg-neutral-950 text-neutral-300 text-xs font-medium flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>{language === "hi" ? "अपनी फ़ोटो अपलोड करें (PNG/JPG)" : "Upload Custom Photo (PNG/JPG)"}</span>
          </button>
        </div>

        {/* Motion Prompt */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              {language === "hi" ? "2. मोशन और कैमरा निर्देश" : "2. Motion & Camera Dynamics"}
            </label>
            <span className="text-[10px] text-amber-400 font-medium">
              Cost: 12 Credits
            </span>
          </div>
          <textarea
            value={motionPrompt}
            onChange={(e) => setMotionPrompt(e.target.value)}
            rows={2}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none transition resize-none"
          />
        </div>

        {/* Motion Intensity */}
        <div>
          <label className="text-xs font-medium text-neutral-400 mb-1 block">
            {language === "hi" ? "मोशन गति और प्रभाव" : "Motion Flow Curve"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Subtle Ambient", "Medium (Cinematic Flow)", "Fast Action Orbit"].map((m) => (
              <button
                key={m}
                onClick={() => setMotionIntensity(m)}
                className={`py-2 text-xs font-medium rounded-xl border transition ${
                  motionIntensity === m
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 font-semibold"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Render Button */}
        <button
          onClick={handleRenderVideo}
          disabled={isRendering || !selectedImage}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isRendering ? "animate-spin" : ""}`} />
          <span>
            {isRendering
              ? language === "hi" ? "फ़ोटो में मोशन जोड़ा जा रहा है..." : "Animating Image in 4K..."
              : language === "hi" ? "इमेज से वीडियो बनाएं (12 क.)" : "Generate Image-to-Video (12 Cr)"}
          </span>
        </button>
      </div>

      {/* Render Queue & Output */}
      {activeJob && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeJob.status === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Clock className="w-5 h-5 text-purple-400 animate-spin" />
              )}
              <h3 className="font-bold text-sm text-white">
                {activeJob.title}
              </h3>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                activeJob.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              }`}
            >
              {activeJob.status} ({activeJob.progress}%)
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
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
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={activeJob.resultUrl}
                  download="image_to_video.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-700"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.download}</span>
                </a>

                <button
                  onClick={() => onSendToEditor(activeJob.resultUrl!)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "एडिटर में खोलें" : "Open in Video Editor"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { 
  Image as ImageIcon, Sparkles, Wand2, Download, Video, 
  Layers, CheckCircle2, AlertCircle, RefreshCw, ZoomIn
} from "lucide-react";
import { Language, UserAccount } from "../types";
import { translations } from "../data/translations";

interface AiImageGeneratorViewProps {
  user: UserAccount;
  language: Language;
  onDeductCredits: (amount: number, feature: string) => Promise<boolean>;
  onOpenCreditsModal: () => void;
  onSendToImageToVideo?: (imageUrl: string) => void;
}

export const AiImageGeneratorView: React.FC<AiImageGeneratorViewProps> = ({
  user,
  language,
  onDeductCredits,
  onOpenCreditsModal,
  onSendToImageToVideo,
}) => {
  const t = translations[language];

  const [prompt, setPrompt] = useState(
    language === "hi"
      ? "यूट्यूब थंबनेल के लिए: एक चौंकता हुआ युवा प्रोग्रामर जिसके चश्मे में AI कोड की नियॉन चमक है, बैकग्राउंड में रोबोटिक्स"
      : "YouTube Thumbnail: Shocked young tech creator reacting to a floating glowing AI hologram, high contrast rim lighting, 8k"
  );
  const [style, setStyle] = useState("YouTube Thumbnail");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=85"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const styles = [
    "YouTube Thumbnail",
    "3D Disney Pixar",
    "Anime / Manga",
    "Photorealistic",
    "Cyberpunk",
    "Watercolor",
  ];

  const presets = language === "hi"
    ? [
        "यूट्यूब शॉर्ट्स के लिए 3D कार्टून शेर जो ताज पहने है",
        "साइबरपंक मुंबई 2077 में मरीन ड्राइव और उड़ती कारें",
        "सुपर रियलिस्टिक अंतरिक्ष यात्री जो मंगल ग्रह पर चाय पी रहा है",
      ]
    : [
        "Viral YouTube thumbnail with bold shock expression & laser eyes",
        "A cute 3D Pixar baby tiger exploring a glowing crystal cavern",
        "Hyperrealistic astronaut brewing coffee on Mars at sunrise",
      ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (user.credits < 2) {
      onOpenCreditsModal();
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        await onDeductCredits(2, "AI Image Generation");
      } else {
        setErrorMsg(data.error || "Failed to generate image");
      }
    } catch (err: any) {
      setErrorMsg("Image generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {t.imageGenTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t.imageGenDesc}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              {language === "hi" ? "इमेज का विवरण / प्रॉम्प्ट" : "Image Description / Prompt"}
            </label>
            <span className="text-[10px] text-amber-400 font-medium">
              Cost: 2 Credits
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none transition resize-none leading-relaxed"
          />
        </div>

        {/* Suggestion Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            {language === "hi" ? "आइडियाज (क्लिक करें):" : "Viral Prompt Suggestions:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition truncate max-w-full text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Style & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "कला शैली (Art Style)" : "Art Style Preset"}
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "पहलू अनुपात" : "Aspect Ratio"}
            </label>
            <div className="grid grid-cols-3 gap-2">
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
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          <span>
            {isGenerating
              ? language === "hi" ? "इमेज बनाई जा रही है..." : "Generating 4K Image..."
              : language === "hi" ? "AI इमेज बनाएं (2 क.)" : "Generate AI Image (2 Cr)"}
          </span>
        </button>
      </div>

      {/* Generated Image Preview Card */}
      {generatedImage && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Generated Image ({style} • {aspectRatio})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Ultra HD
            </span>
          </div>

          <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border border-neutral-700 shadow-xl bg-black">
            <img
              src={generatedImage}
              alt="Generated Result"
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <a
              href={generatedImage}
              download="creator_ai_image.png"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PNG</span>
            </a>

            {onSendToImageToVideo && (
              <button
                onClick={() => onSendToImageToVideo(generatedImage)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "इसे वीडियो में बदलें" : "Turn into Video"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

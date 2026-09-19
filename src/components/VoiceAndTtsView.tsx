import React, { useState, useRef } from "react";
import { 
  Mic, Volume2, Play, Pause, Download, Sparkles, Wand2, 
  RotateCcw, Sliders, Globe, CheckCircle2, AlertCircle, Radio
} from "lucide-react";
import { Language, UserAccount } from "../types";
import { translations } from "../data/translations";

interface VoiceAndTtsViewProps {
  user: UserAccount;
  language: Language;
  onDeductCredits: (amount: number, feature: string) => Promise<boolean>;
  onOpenCreditsModal: () => void;
  onSendToEditorAudio?: (audioText: string) => void;
}

interface VoiceProfile {
  id: string;
  name: string;
  gender: "Male" | "Female";
  language: "English" | "Hindi";
  accent: string;
  description: string;
  tag: string;
}

export const VoiceAndTtsView: React.FC<VoiceAndTtsViewProps> = ({
  user,
  language,
  onDeductCredits,
  onOpenCreditsModal,
  onSendToEditorAudio,
}) => {
  const t = translations[language];

  // Voices library
  const voices: VoiceProfile[] = [
    {
      id: "aarav",
      name: "Aarav",
      gender: "Male",
      language: "Hindi",
      accent: "Indian Neutral",
      description: "Deep, confident, cinematic storytelling voice perfect for historical and thriller shorts.",
      tag: "Top Indian Voice",
    },
    {
      id: "priya",
      name: "Priya",
      gender: "Female",
      language: "Hindi",
      accent: "Urban Mumbai",
      description: "Energetic, expressive, crystal clear voice ideal for tech explainers and daily news reels.",
      tag: "Viral Shorts",
    },
    {
      id: "kore",
      name: "Kore (Gemini)",
      gender: "Female",
      language: "English",
      accent: "Warm Studio",
      description: "Soothing, articulate and highly intelligent narrator voice with natural pauses.",
      tag: "Gemini AI",
    },
    {
      id: "zephyr",
      name: "Zephyr (Gemini)",
      gender: "Male",
      language: "English",
      accent: "Dynamic US",
      description: "Punchy, fast-paced creator voice with high retention dynamics.",
      tag: "Top Retention",
    },
    {
      id: "rohan",
      name: "Rohan",
      gender: "Male",
      language: "Hindi",
      accent: "Delhi Friendly",
      description: "Casual, relatable youth persona great for comedy clips, memes and gaming shorts.",
      tag: "Casual / Comedy",
    },
    {
      id: "maya",
      name: "Maya",
      gender: "Female",
      language: "English",
      accent: "British Elegant",
      description: "Sophisticated luxury documentary tone with impeccable clarity.",
      tag: "Documentary",
    },
  ];

  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [textToSpeak, setTextToSpeak] = useState(
    language === "hi"
      ? "क्या आप जानते हैं? 2026 में 85 प्रतिशत वायरल यूट्यूब शॉर्ट्स में AI आवाज़ का उपयोग किया जा रहा है। जानिए कैसे आप भी सिर्फ 1 क्लिक में प्रो वॉइसओवर बना सकते हैं!"
      : "Did you know? In 2026, over 85 percent of viral YouTube Shorts use high-fidelity AI voiceovers. Here is how you can clone studio quality in seconds!"
  );
  const [emotion, setEmotion] = useState("Excited / Viral Hook");
  const [speed, setSpeed] = useState(1.05);
  const [pitch, setPitch] = useState(1.0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const sampleVoicePrompts = language === "hi"
    ? [
        "रुकिए! अगर आप एक क्रिएटर हैं, तो इस सीक्रेट को बिल्कुल मिस मत करना।",
        "सदियों पहले, हिमालय की गोद में एक ऐसा रहस्य छुपा था जिसे वैज्ञानिक आज भी नहीं समझ पाए।",
        "आज के इस 60 सेकंड के शॉर्ट में हम बात करेंगे 3 सबसे क्रांतिकारी AI टूल्स की!",
      ]
    : [
        "Wait! Before you scroll, this 1 hack will double your retention rate on YouTube Shorts.",
        "Deep beneath the Antarctic ice sheets, satellites just picked up a signal that shouldn't exist.",
        "Top 3 productivity AI apps you need on your phone right now.",
      ];

  const handleSynthesizeVoice = async () => {
    if (!textToSpeak.trim()) return;
    if (user.credits < 4) {
      onOpenCreditsModal();
      return;
    }

    setIsSynthesizing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: selectedVoice,
          language,
          emotion,
        }),
      });

      const data = await res.json();
      await onDeductCredits(4, "AI Voiceover");
      setSuccessMsg(language === "hi" ? "आवाज़ सफलतापूर्वक तैयार हो गई!" : "Voiceover synthesized successfully!");

      // Play synthesized voice via Web Speech API or Audio buffer
      handlePlayBrowserSpeech();
    } catch (err: any) {
      setErrorMsg("Voice generation failed: " + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePlayBrowserSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const activeV = voices.find((v) => v.id === selectedVoice);
    utterance.lang = activeV?.language === "Hindi" ? "hi-IN" : "en-US";
    utterance.rate = speed;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Mic className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {t.voiceTtsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t.voiceTtsDesc}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Voice Selection Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300">
            {language === "hi" ? "AI वॉयस मॉडल चुनें" : "Select Voiceover Persona"}
          </label>
          <span className="text-[10px] text-neutral-400">
            {voices.length} Premium Studio Voices
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {voices.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVoice(v.id)}
              className={`p-3 rounded-xl text-left border transition relative flex items-start gap-3 ${
                selectedVoice === v.id
                  ? "bg-blue-500/15 border-blue-500 shadow-md shadow-blue-500/10"
                  : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  selectedVoice === v.id
                    ? "bg-blue-500 text-white"
                    : "bg-neutral-800 text-neutral-300"
                }`}
              >
                {v.gender === "Female" ? "F" : "M"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm font-bold text-white truncate">{v.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {v.language}
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-500/20 text-blue-300 flex-shrink-0">
                    {v.tag}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                  {v.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Script Text Input */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              {language === "hi" ? "स्क्रिप्ट टेक्स्ट दर्ज करें" : "Script Text for Voiceover"}
            </label>
            <span className="text-[10px] text-amber-400 font-medium">
              Cost: 4 Credits
            </span>
          </div>
          <textarea
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            rows={4}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none transition resize-none leading-relaxed"
          />
        </div>

        {/* Quick hooks */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            {language === "hi" ? "वायरल हुक के उदाहरण:" : "Quick Hook Examples:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleVoicePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setTextToSpeak(p)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition truncate max-w-full text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Emotion & Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 block">
              {language === "hi" ? "भाव / अंदाज़ (Emotion)" : "Tone & Style"}
            </label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="Excited / Viral Hook">Excited / Viral Hook</option>
              <option value="Dramatic / Mystery">Dramatic / Mystery</option>
              <option value="Calm / Documentary">Calm / Documentary</option>
              <option value="Storyteller Warm">Storyteller Warm</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 flex items-center justify-between">
              <span>{language === "hi" ? "गति (Speed)" : "Speed"}</span>
              <span className="text-blue-400 font-bold">{speed}x</span>
            </label>
            <input
              type="range"
              min={0.8}
              max={1.4}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-blue-500 bg-neutral-800 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400 mb-1 flex items-center justify-between">
              <span>{language === "hi" ? "पिच (Pitch)" : "Pitch"}</span>
              <span className="text-blue-400 font-bold">{pitch}</span>
            </label>
            <input
              type="range"
              min={0.8}
              max={1.3}
              step={0.05}
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-blue-500 bg-neutral-800 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Audio Waveform Simulator */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayBrowserSpeech}
              className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition shadow-md shadow-blue-500/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <span className="text-xs font-bold text-white block">
                {voices.find((v) => v.id === selectedVoice)?.name} — {emotion}
              </span>
              <span className="text-[10px] text-neutral-400">
                {isPlaying ? "Playing voiceover..." : "Ready to listen"}
              </span>
            </div>
          </div>

          {/* Simulated Waveform Visualizer */}
          <div className="flex items-end gap-1 h-6">
            {[40, 75, 95, 60, 30, 85, 100, 50, 70, 90, 45, 60].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying ? "bg-blue-400 animate-pulse" : "bg-neutral-700"
                }`}
                style={{ height: isPlaying ? `${h}%` : "30%" }}
              />
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleSynthesizeVoice}
          disabled={isSynthesizing || !textToSpeak.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isSynthesizing ? "animate-spin" : ""}`} />
          <span>
            {isSynthesizing
              ? language === "hi" ? "आवाज़ तैयार हो रही है..." : "Synthesizing AI Audio..."
              : language === "hi" ? "AI वॉइस जनरेट करें (4 क.)" : "Generate AI Voiceover (4 Cr)"}
          </span>
        </button>
      </div>
    </div>
  );
};

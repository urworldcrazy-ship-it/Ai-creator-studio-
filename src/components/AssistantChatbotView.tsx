import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, Send, Sparkles, User, Copy, Check, RotateCcw, 
  Wand2, Compass, Film, Hash, MessageSquare 
} from "lucide-react";
import { Language, UserAccount, ChatMessage } from "../types";
import { translations } from "../data/translations";

interface AssistantChatbotViewProps {
  user: UserAccount;
  language: Language;
  onSendToVideoGenerator: (prompt: string) => void;
}

export const AssistantChatbotView: React.FC<AssistantChatbotViewProps> = ({
  user,
  language,
  onSendToVideoGenerator,
}) => {
  const t = translations[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting: ChatMessage = {
    id: "msg-welcome",
    sender: "model",
    text: language === "hi"
      ? "नमस्ते! मैं आपका CreatorAI रणनीतिकार हूँ। 🚀\n\nमैं आपके YouTube Shorts और Instagram Reels को वायरल बनाने में मदद कर सकता हूँ:\n• 3 सेकंड का सम्मोहक 'हुक' तैयार करना\n• 60fps वीडियो स्टोरीबोर्ड और स्क्रिप्ट\n• ट्रेंडिंग हैशटैग और थंबनेल सलाह\n\nआज हम किस विचार पर काम करें?"
      : "Welcome to CreatorAI Studio! 🚀\n\nI'm your dedicated AI Viral Strategist and Script Doctor. I can help you:\n• Engineer high-retention 3-second hooks\n• Draft full multi-scene Shorts/Reels scripts\n• Optimize SEO titles, hashtags & thumbnail psychology\n\nWhat viral video idea are we crafting today?",
    timestamp: "Just now",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = language === "hi"
    ? [
        "AI टूल्स पर 15 सेकंड की वायरल यूट्यूब शॉर्ट्स स्क्रिप्ट लिखो",
        "मेरी मिस्ट्री वीडियो के लिए 3 ज़बरदस्त हुक दो",
        "हिंदी में 3D कार्टून कहानी का प्लॉट बताओ",
      ]
    : [
        "Write a 15-second viral Shorts script about future AI tools",
        "Give me 3 irresistible psychological curiosity hooks",
        "What are the best viral tags for a tech explainer reel?",
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          language,
        }),
      });

      const data = await res.json();
      const modelReply: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "model",
        text: data.reply || "Let's turn that idea into a video right now!",
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, modelReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "model",
          text: "Apologies, I encountered a brief network delay. Please retry.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-5 flex flex-col h-[calc(100vh-120px)] max-h-[850px] pb-20 sm:pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-white font-display">
                CreatorAI Strategist
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Viral hooks, script doctoring & growth consulting
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([initialGreeting])}
          className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                m.sender === "user"
                  ? "bg-rose-500 text-white"
                  : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                m.sender === "user"
                  ? "bg-rose-600 text-white rounded-tr-none font-medium"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none space-y-2"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.sender === "model" && m.id !== "msg-welcome" && (
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80 text-[11px]">
                  <button
                    onClick={() => copyToClipboard(m.text, m.id)}
                    className="flex items-center gap-1 text-neutral-400 hover:text-white transition"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSendToVideoGenerator(m.text.slice(0, 150))}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold transition ml-auto"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Generate Video</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 italic">
            <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            </div>
            <span>Strategist is analyzing virality factors...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="text-[11px] px-3 py-1 rounded-full bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 whitespace-nowrap transition"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 focus-within:border-purple-500 transition shadow-xl"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === "hi"
                ? "पूछें: हुक, स्क्रिप्ट, हैशटैग या वीडियो आइडिया..."
                : "Ask for viral hooks, script doctoring, thumbnail advice..."
            }
            className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-500 to-rose-500 hover:opacity-95 text-white transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { 
  X, Check, Zap, ShieldCheck, Play, Sparkles, AlertCircle, 
  CreditCard, Apple, RefreshCw, Star, Flame, Trophy
} from "lucide-react";
import confetti from "canvas-confetti";
import { Language, UserAccount } from "../types";
import { translations } from "../data/translations";

interface MonetizationModalProps {
  isOpen: boolean;
  user: UserAccount;
  language: Language;
  onClose: () => void;
  onUpgradePlan: (plan: "creator_pro" | "studio_ultra") => Promise<void>;
  onBuyCreditPack: (amount: number) => Promise<void>;
  onRewardAdWatched: () => Promise<void>;
  onRestorePurchases: () => Promise<void>;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  user,
  language,
  onClose,
  onUpgradePlan,
  onBuyCreditPack,
  onRewardAdWatched,
  onRestorePurchases,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");

  // Plans
  const plans = [
    {
      id: "creator_pro" as const,
      name: t.proPlan,
      price: billingCycle === "monthly" ? "$19" : "$190",
      period: billingCycle === "monthly" ? t.billingMonthly : t.billingYearly,
      creditsIncluded: 500,
      badge: "Most Popular",
      features: [
        "500 Premium AI Credits/month",
        "No Watermark (Clean 1080p Shorts)",
        "Priority AI GPU Render Queue",
        "All 3D Cartoon Story Voices",
        "Commercial Social Media License",
      ],
      color: "from-rose-500 to-purple-600",
    },
    {
      id: "studio_ultra" as const,
      name: t.ultraPlan,
      price: billingCycle === "monthly" ? "$49" : "$490",
      period: billingCycle === "monthly" ? t.billingMonthly : t.billingYearly,
      creditsIncluded: 1800,
      badge: "High Output",
      features: [
        "1,800 Premium AI Credits/month",
        "Lossless 4K 60fps Video Renders",
        "Dedicated VIP GPU Cluster",
        "Full Hindi & English Voice Cloning",
        "Direct ProRes YouTube Shorts Export",
        "24/7 Dedicated Creator Support",
      ],
      color: "from-amber-500 to-rose-500",
    },
  ];

  // One-time credit packs
  const creditPacks = [
    { credits: 100, price: "$4.99", popular: false },
    { credits: 500, price: "$19.99", popular: true },
    { credits: 2500, price: "$79.99", popular: false },
  ];

  // Handle Simulated Google Rewarded Ad
  const handleStartWatchAd = () => {
    setIsWatchingAd(true);
    setAdCountdown(5);

    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsWatchingAd(false);
          onRewardAdWatched();
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
          setStatusNotice(language === "hi" ? "बधाई! आपको +15 AI क्रेडिट्स मिले!" : "Congratulations! +15 Free Credits Added!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelectPlan = async (planId: "creator_pro" | "studio_ultra") => {
    setIsProcessingPay(true);
    try {
      await onUpgradePlan(planId);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      setStatusNotice("Subscription successfully activated! Enjoy Creator Pro benefits.");
      setTimeout(() => {
        setIsProcessingPay(false);
        onClose();
      }, 1500);
    } catch {
      setIsProcessingPay(false);
    }
  };

  const handleSelectPack = async (amount: number) => {
    setIsProcessingPay(true);
    try {
      await onBuyCreditPack(amount);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      setStatusNotice(`+${amount} Credits added to your account!`);
      setTimeout(() => {
        setIsProcessingPay(false);
        onClose();
      }, 1500);
    } catch {
      setIsProcessingPay(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh] no-scrollbar space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                {language === "hi" ? "AI क्रेडिट्स और प्रो प्लान" : "CreatorAI Studio Subscriptions & Credits"}
              </h2>
              <span className="text-xs text-amber-400 font-semibold">
                Current Balance: {user.credits} Credits • {user.plan.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Free Rewarded Ad Feature */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-300 flex items-center justify-center sm:justify-start gap-1">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              {language === "hi" ? "मुफ़्त क्रेडिट्स चाहिए?" : "Need Free AI Credits?"}
            </span>
            <p className="text-[11px] text-neutral-300">
              {language === "hi"
                ? "एक छोटा 5-सेकंड विज्ञापन देखकर +15 फ्री क्रेडिट्स तुरंत पाएं।"
                : "Watch a short 5-second sponsor clip to receive +15 Free Credits."}
            </p>
          </div>

          <button
            onClick={handleStartWatchAd}
            disabled={isWatchingAd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition flex-shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isWatchingAd ? `Ad Playing (${adCountdown}s)...` : t.watchAd}</span>
          </button>
        </div>

        {/* Simulated Video Ad Screen if active */}
        {isWatchingAd && (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-700 text-center space-y-2 animate-fade-in">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Sponsored Partner Ad
            </span>
            <div className="aspect-[16/9] max-w-xs mx-auto rounded-xl bg-neutral-900 flex flex-col items-center justify-center border border-neutral-800 p-4">
              <Sparkles className="w-8 h-8 text-rose-400 animate-spin mb-2" />
              <p className="text-xs text-white font-semibold">
                CreatorAI Studio Cloud GPU Rendering
              </p>
              <span className="text-xs text-neutral-400 mt-1 font-mono">
                Reward in {adCountdown}s
              </span>
            </div>
          </div>
        )}

        {/* Billing Switch (Monthly vs Yearly) */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="bg-neutral-950 p-1 rounded-xl border border-neutral-800 flex items-center">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition ${
                billingCycle === "monthly"
                  ? "bg-rose-500 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-rose-500 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-black font-extrabold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 sm:p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                user.plan === plan.id
                  ? "bg-rose-500/10 border-rose-500 shadow-xl"
                  : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-[9px] font-bold uppercase text-white shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-1 mb-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-neutral-400">{plan.period}</span>
                </div>

                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-3 border-t border-neutral-800/80">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={user.plan === plan.id || isProcessingPay}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    user.plan === plan.id
                      ? "bg-neutral-800 text-neutral-400 cursor-default"
                      : "bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white shadow-lg shadow-rose-500/20"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>
                    {user.plan === plan.id
                      ? "Active Plan"
                      : language === "hi" ? "प्लान चुनें (Play / App Store)" : "Subscribe via App Store / Play"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instant Credit Packs */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">
              {language === "hi" ? "वन-टाइम क्रेडिट टॉप-अप" : "One-Time Credit Top-Ups"}
            </span>
            <span className="text-[10px] text-neutral-400">
              Credits never expire
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {creditPacks.map((pack) => (
              <button
                key={pack.credits}
                onClick={() => handleSelectPack(pack.credits)}
                disabled={isProcessingPay}
                className={`p-3 rounded-xl border text-center transition hover:scale-102 flex flex-col items-center justify-between gap-1 ${
                  pack.popular
                    ? "bg-purple-500/15 border-purple-500 shadow-md"
                    : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center gap-1 text-amber-300 font-extrabold text-sm">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  <span>+{pack.credits}</span>
                </div>
                <span className="text-xs font-bold text-white">
                  {pack.price}
                </span>
                <span className="text-[9px] text-neutral-400">
                  Instant Top-up
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Store & Transparency Footer */}
        <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-neutral-400">
          <button
            onClick={onRestorePurchases}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restore In-App Purchases</span>
          </button>
          <span>Powered by Google Play Billing & Apple IAP</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[10px] text-neutral-500 text-center leading-relaxed">
          {t.monetizationNotice}
        </div>
      </div>
    </div>
  );
};

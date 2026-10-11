"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getPricingPlans } from "@/lib/firebase/services";

export default function Pricing() {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [hasCopiedCodes, setHasCopiedCodes] = useState<Record<string, boolean>>({});
  const [shakingFirmId, setShakingFirmId] = useState<string | null>(null);
  const [warningFirmId, setWarningFirmId] = useState<string | null>(null);
  const [firms, setFirms] = useState<any[]>([]);

  useEffect(() => {
    async function loadPricing() {
      try {
        const data = await getPricingPlans();
        if (data && data.length > 0 && data[0].logo) {
          setFirms(data);
        } else {
          setFirms(DEFAULT_FIRMS);
        }
      } catch (err) {
        console.error("Failed to load pricing plans:", err);
        setFirms(DEFAULT_FIRMS);
      }
    }
    loadPricing();
  }, []);

  const DEFAULT_FIRMS = [
    {
      id: "orion-funded",
      name: "Orion Funded",
      logo: "/logos/orion-funded.svg",
      reviewUrl: "/firms/orion-funded",
      steps: 2,
      accountSize: "$5K - $200K",
      evalType: "( 2-Step )",
      isMostPop: true,
      profitTarget: "6% | 6%",
      drawdownDaily: "3%",
      drawdownMax: "6%",
      lossType: "Static",
      profitSplit: "80%",
      discount: "50% OFF",
      copyBtnText: "50% OFF",
      code: "EMPIRIAL50",
      buyUrl: "https://www.orionfunded.com?coupon=EMPIRIAL50",
    },
    {
      id: "ck-capital",
      name: "CK Capital",
      logo: "/logos/ck-capital.avif",
      reviewUrl: "/firms/ck-capital",
      steps: 2,
      accountSize: "$10K - $200K",
      evalType: "( 2-Step )",
      isMostPop: false,
      profitTarget: "8% | 5%",
      drawdownDaily: "5%",
      drawdownMax: "10%",
      lossType: "Static",
      profitSplit: "Up to 80%",
      discount: "30% OFF",
      copyBtnText: "30% OFF",
      code: "EMPIRE",
      buyUrl: "/challenges?firm=ck-capital&step=2",
    },
    {
      id: "alpha-capital",
      name: "Alpha Capital",
      logo: "/logos/alpha-capital.png",
      reviewUrl: "/firms/alpha-capital",
      steps: 0,
      accountSize: "$5K - $300K",
      evalType: "( Instant )",
      isMostPop: false,
      profitTarget: "8%",
      drawdownDaily: "4%",
      drawdownMax: "8%",
      lossType: "Static",
      profitSplit: "80%",
      discount: "20% DISCOUNT",
      copyBtnText: "20% OFF",
      code: "EMPIRE",
      buyUrl: "/challenges?firm=alpha-capital&step=0",
    },
  ];

  const getCopyButtonLabel = (firm: any) => {
    if (copiedCode === firm.id) return "Copied!";
    if (hasCopiedCodes[firm.id]) return "Code Copied ✓";

    if (firm.copyBtnText) return firm.copyBtnText;
    if (firm.copy_btn_text) return firm.copy_btn_text;

    if (firm.discount) {
      const d = firm.discount.trim();
      if (d.toUpperCase().endsWith("DISCOUNT")) {
        return d.replace(/DISCOUNT/i, "OFF").trim();
      }
      return d;
    }

    return `${firm.discount_pct || 20}% OFF`;
  };

  const handleCopyCode = (code: string, firmId: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(code);
      setHasCopiedCodes((prev) => ({ ...prev, [firmId]: true }));
      setCopiedCode(firmId);
      setWarningFirmId(null);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleBuyChallenge = (e: React.MouseEvent, firm: any) => {
    if (!hasCopiedCodes[firm.id]) {
      e.preventDefault();
      // Trigger vibrating shake effect on Code button
      setShakingFirmId(firm.id);
      setWarningFirmId(firm.id);

      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([60, 50, 60, 50, 80]);
        } catch (_) {}
      }

      setTimeout(() => setShakingFirmId(null), 650);
      setTimeout(() => setWarningFirmId(null), 4000);
      return;
    }

    // If code copied, transfer to Challenges page with firm & step filters applied
    const targetFirm = firm.firmSlug || firm.id;
    const stepVal = firm.steps !== undefined ? firm.steps : 2;

    let targetUrl = firm.buyUrl;
    if (!targetUrl || targetUrl.startsWith('/challenges')) {
      targetUrl = `/challenges?firm=${encodeURIComponent(targetFirm)}&step=${stepVal}`;
    }
    router.push(targetUrl);
  };

  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 md:px-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12 flex flex-col gap-3 text-center sm:mb-16"
      >
        <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
          Choose Your Plan
        </h2>
        <p className="mx-auto max-w-xl text-muted-foreground text-center text-sm sm:text-base">
          Select the perfect evaluation plan for your trading goals. Upgrade or scale at any time.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 md:gap-6 lg:gap-8 items-stretch">
        {firms.slice(0, 3).map((firm, index) => {
          const logoSrc = firm.logo || firm.logo_url || firm.image || "/logos/nys.png";
          return (
            <motion.div
              key={firm.id || index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative flex flex-col ${
                firm.isMostPop ? "md:-translate-y-1 z-10" : ""
              }`}
            >
              <div
                className={`relative h-full rounded-[24px] flex flex-col justify-between p-6 sm:p-7 transition-all duration-200 ${
                  firm.isMostPop
                    ? "border-2 border-black dark:border-white bg-[#f4f4f5]/75 dark:bg-card backdrop-blur-md shadow-sm"
                    : "border border-zinc-200/80 dark:border-border bg-white/60 dark:bg-card backdrop-blur-md shadow-none"
                }`}
              >
                {firm.isMostPop && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="rounded-full border border-black dark:border-white bg-white dark:bg-card px-4 py-0.5 text-xs font-semibold text-foreground whitespace-nowrap shadow-none">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  {/* Header: Firm Name & Logo & Review Button */}
                  <div className="text-center flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold sm:text-xl text-foreground">
                      {firm.name}
                    </h3>
                    
                    {/* Logo - Slightly Larger with rounded-md edges */}
                    <div className="my-2.5 flex items-center justify-center h-12 w-full">
                      <img
                        src={logoSrc}
                        alt={firm.name}
                        className="h-11 sm:h-12 w-auto max-w-[140px] sm:max-w-[160px] object-contain rounded-md"
                      />
                    </div>

                    {/* Review Button */}
                    <button
                      type="button"
                      onClick={() => router.push(firm.reviewUrl || `/firms/${firm.firmSlug || firm.id}`)}
                      className="mb-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Read Review</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </button>

                    {/* Main Detail Before Dividing Line */}
                    <div className="mt-2 flex flex-col items-center">
                      <span className="text-2xl font-extrabold sm:text-3xl text-foreground tracking-tight">
                        {firm.accountSize || "$100K"}
                      </span>
                      <span className="mt-1 text-xs font-semibold text-muted-foreground">
                        {firm.evalType || "( 2-Step )"}
                      </span>
                    </div>
                  </div>

                  {/* Dividing Line */}
                  <div className="my-5 h-[1px] w-full bg-zinc-200/80 dark:bg-border" />

                  {/* Details After Dividing Line */}
                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* 1st. PROFIT TARGET */}
                    <div className="flex justify-between items-center py-1 border-b border-zinc-200/50 dark:border-border/40">
                      <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wide">
                        Profit Target
                      </span>
                      <span className={`font-bold text-foreground ${firm.profitTarget === "∞" ? "text-xl sm:text-2xl font-extrabold leading-none" : "text-sm"}`}>
                        {firm.profitTarget || "8%"}
                      </span>
                    </div>

                    {/* 2nd. DRAWDOWN (Daily | Max) */}
                    <div className="flex justify-between items-center py-1 border-b border-zinc-200/50 dark:border-border/40">
                      <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wide">
                        Drawdown <span className="text-[10px] text-muted-foreground font-normal">(Daily | Max)</span>
                      </span>
                      <span className="font-bold text-foreground">
                        {firm.drawdownDaily || "5%"} | {firm.drawdownMax || "10%"}
                      </span>
                    </div>

                    {/* 3rd. MAX LOSS TYPE */}
                    <div className="flex justify-between items-center py-1 border-b border-zinc-200/50 dark:border-border/40">
                      <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wide">
                        Max Loss Type
                      </span>
                      <span className="font-bold text-foreground">
                        {firm.lossType || "Static"}
                      </span>
                    </div>

                    {/* 4th. PROFIT SPLIT */}
                    <div className="flex justify-between items-center py-1">
                      <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wide">
                        Profit Split
                      </span>
                      <span className="font-bold text-foreground">
                        {firm.profitSplit || "80%"}
                      </span>
                    </div>
                  </div>

                  {/* Discount Display: XX% DISCOUNT with ( Max you can get ) */}
                  <div className="mt-5 pt-3 border-t border-zinc-200/70 dark:border-border/70 flex flex-col items-center justify-center text-center">
                    <span className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                      {firm.discount || "20% DISCOUNT"}
                    </span>
                    <span className="mt-0.5 text-xs text-muted-foreground font-medium">
                      ( Max you can get )
                    </span>
                  </div>
                </div>

                {/* Bottom Buttons Section */}
                <div className="mt-5 pt-1 flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2 w-full">
                    {/* Code Empire Button with Vibrating Shake Effect */}
                    <motion.button
                      type="button"
                      animate={shakingFirmId === firm.id ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onClick={() => handleCopyCode(firm.code || "EMPIRE", firm.id)}
                      className={`flex-1 font-semibold rounded-xl h-10 text-xs sm:text-sm border transition-colors cursor-pointer flex items-center justify-center shadow-xs ${
                        hasCopiedCodes[firm.id]
                          ? "border-black dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-black font-bold"
                          : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800"
                      }`}
                    >
                      {getCopyButtonLabel(firm)}
                    </motion.button>

                    {/* Buy Challenge Button */}
                    <button
                      type="button"
                      onClick={(e) => handleBuyChallenge(e, firm)}
                      className="flex-1 font-semibold rounded-xl h-10 text-xs sm:text-sm bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                    >
                      Buy Challenge
                    </button>
                  </div>

                  {/* Notification Warning Message */}
                  <AnimatePresence>
                    {warningFirmId === firm.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="w-full text-center text-[11px] sm:text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-md flex items-center justify-center gap-1"
                      >
                        <span>⚠️ Kindly Copy code for Max Discount</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

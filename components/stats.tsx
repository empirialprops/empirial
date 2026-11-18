"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, getLivePlatformStats, subscribeLiveActiveTraders } from "@/lib/firebase/services";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";

const DEFAULT_STATS = [
  { value: 0, suffix: "+", label: "Active Traders" },
  { value: 7, suffix: "+", label: "Verified Firms" },
  { value: 42, suffix: "+", label: "Challenges" },
  { value: 150, suffix: "+", label: "Community Reviews" },
];

export default function Stats() {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── One-time fetch for firms, challenges, reviews ──
  useEffect(() => {
    async function loadStats() {
      try {
        const [settings, liveStats] = await Promise.all([
          getSiteSettings(),
          getLivePlatformStats(),
        ]);

        // Admin manually overrode stats — respect that
        if (settings && settings.stats_auto_sync === false && settings.stats && settings.stats.length >= 4) {
          setStats(settings.stats);
          return;
        }

        const rawReviews = liveStats.reviews || 150;
        const reviewsVal = rawReviews >= 1000
          ? Number((rawReviews / 1000).toFixed(rawReviews % 1000 === 0 ? 0 : 1))
          : rawReviews;
        const reviewsSuffix = rawReviews >= 1000 ? "K+" : "+";

        const rawTraders = liveStats.activeTraders || 0;
        const tradersVal = rawTraders >= 1000
          ? Number((rawTraders / 1000).toFixed(rawTraders % 1000 === 0 ? 0 : 1))
          : rawTraders;
        const tradersSuffix = rawTraders >= 1000 ? "K+" : "+";

        setStats((prev) => [
          { value: tradersVal, suffix: tradersSuffix, label: "Active Traders" },
          { value: liveStats.verifiedFirms || 7, suffix: "+", label: "Verified Firms" },
          { value: liveStats.challenges || 42, suffix: "+", label: "Challenges" },
          { value: reviewsVal, suffix: reviewsSuffix, label: "Community Reviews" },
        ]);
      } catch (err) {
        console.error("Failed to load dynamic stats:", err);
      }
    }
    loadStats();
  }, []);

  // ── Real-time live subscription for Active Traders ──
  useEffect(() => {
    const unsub = subscribeLiveActiveTraders((liveCount) => {
      setStats((prev) => {
        const count = liveCount;
        const val = count >= 1000 ? Number((count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)) : count;
        const suffix = count >= 1000 ? "K+" : "+";
        return [
          { value: val, suffix, label: "Active Traders" },
          prev[1],
          prev[2],
          prev[3],
        ];
      });
    });
    return () => unsub();
  }, []);

  return (
    <section className="py-16 sm:py-20 px-4 bg-transparent w-full">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
          onViewportEnter={() => setAnimate(true)}
          viewport={{ once: true, amount: 0.4 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-1.5 flex items-center justify-center">
                {mounted ? (
                  <>
                    <NumberFlow
                      value={animate ? stat.value : stat.value}
                      format={{
                        maximumFractionDigits: stat.value % 1 === 0 ? 0 : 1,
                      }}
                    />
                    <span>{stat.suffix}</span>
                  </>
                ) : (
                  <span>
                    {stat.value}
                    {stat.suffix}
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

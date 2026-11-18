"use client";

import React, { useState } from "react";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Zap, Globe2 } from "lucide-react";

export function StatsCounter() {
  const [animate, setAnimate] = useState(false);

  const stats = [
    {
      value: 124,
      prefix: "$",
      suffix: "M+",
      label: "Verified Payouts Audited",
      desc: "Cryptographically checked certificates",
      icon: TrendingUp,
      accent: "from-cyan-500 to-blue-600",
    },
    {
      value: 48,
      prefix: "",
      suffix: "+",
      label: "Regulated & Audited Firms",
      desc: "Deep rule analytics & spread monitoring",
      icon: ShieldCheck,
      accent: "from-emerald-500 to-teal-600",
    },
    {
      value: 99.9,
      prefix: "",
      suffix: "%",
      label: "Real-Time Telemetry Uptime",
      desc: "Sub-second spread & rule alerts",
      icon: Zap,
      accent: "from-amber-500 to-orange-600",
    },
    {
      value: 150,
      prefix: "",
      suffix: "K+",
      label: "Active Global Traders",
      desc: "Across 140+ countries worldwide",
      icon: Globe2,
      accent: "from-purple-500 to-indigo-600",
    },
  ];

  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onViewportEnter={() => setAnimate(true)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="relative group rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.accent} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    LIVE DATA
                  </span>
                </div>

                <div className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-1 flex items-baseline gap-0.5">
                  {stat.prefix && <span>{stat.prefix}</span>}
                  <NumberFlow
                    value={animate ? stat.value : 0}
                    format={{
                      maximumFractionDigits: stat.value % 1 === 0 ? 0 : 1,
                    }}
                  />
                  <span>{stat.suffix}</span>
                </div>

                <div className="text-sm font-semibold text-foreground/90 mb-1">
                  {stat.label}
                </div>

                <div className="text-xs text-muted-foreground">
                  {stat.desc}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default StatsCounter;

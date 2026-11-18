"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, TrendingUp, Zap, Layers, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Hero() {
  return (
    <div className="relative justify-center items-center overflow-hidden">
      {/* Background Animated Light Ray (from saas-landing-template) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="w-full h-full absolute -top-24 flex justify-center items-center pointer-events-none -z-10"
      >
        <div className="w-3/4 flex justify-center items-center">
          <div className="w-24 h-96 bg-cyan-500/20 dark:bg-cyan-400/15 blur-[90px] rounded-full rotate-12 will-change-transform animate-pulse"></div>
          <div className="w-32 h-80 bg-blue-600/15 dark:bg-blue-500/10 blur-[100px] rounded-full -rotate-12 will-change-transform"></div>
        </div>
      </motion.div>

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-12 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0 }}
          className="flex flex-col justify-center items-center space-y-6 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 border border-border/80 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>EMPIRIAL 2.0 Engine</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-cyan-500 font-medium">Over $124M+ Payouts Audited</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
            The Ultimate Prop Trading{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 bg-clip-text text-transparent">
              Intelligence Matrix
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Compare 500+ evaluation challenges with 5-segment profit split gauges, track forensic payout proofs, and unlock verified discount codes up to 80%.
          </p>

          {/* CTA Buttons */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Button asChild size="lg" variant="gradient">
              <Link href="/challenges">
                <span>Explore 13-Col Matrix</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/compare">
                <Layers className="w-4 h-4 mr-1 text-cyan-500" />
                <span>Compare Firms</span>
              </Link>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="ghost" className="gap-1.5">
                  <PlayCircle className="w-4 h-4 text-cyan-500" />
                  <span>Interactive Tour</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Welcome to EMPIRIAL 2.0</DialogTitle>
                  <DialogDescription>
                    The premier institutional-grade intelligence portal for prop firm traders.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm text-muted-foreground py-2">
                  <div className="flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Forensic Verification:</strong> Every payout receipt is cross-audited on-chain and broker ledger verified.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Real-Time Spreads:</strong> Live streaming spreads across EURUSD, GBPUSD, XAUUSD, and US30.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Instant Savings:</strong> One-click discount codes verified daily by the Anuraj FX team.
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button asChild variant="gradient" size="sm">
                    <Link href="/challenges">Start Comparing Challenges</Link>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Key Verification Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Forensic Payout Auditing</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span>Real-Time Broker Spreads</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Daily Verified Coupons</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Hero;

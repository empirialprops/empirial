"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSiteSettings } from "@/lib/firebase/services";

export default function Hero() {
  const defaultHero = {
    title: "TRUSTED EMPIRE OF PROP TRADERS",
    subtitle: "Compare prop firms, grab verified discount codes, and access our trading community",
    cta1Text: "GRAB OFFERS",
    cta1Url: "/deals",
    cta2Text: "Join Discord",
    cta2Url: "https://discord.gg/ww4dkeeZdp"
  };

  // Start with real content immediately — no waiting for Firestore
  const [heroData, setHeroData] = useState<typeof defaultHero>(defaultHero);

  useEffect(() => {
    async function loadHero() {
      try {
        const settings = await getSiteSettings();
        if (settings && settings.hero) {
          setHeroData({
            title: settings.hero.title || defaultHero.title,
            subtitle: settings.hero.subtitle || defaultHero.subtitle,
            cta1Text: settings.hero.cta1Text || defaultHero.cta1Text,
            cta1Url: settings.hero.cta1Url || defaultHero.cta1Url,
            cta2Text: settings.hero.cta2Text || defaultHero.cta2Text,
            cta2Url: settings.hero.cta2Url || defaultHero.cta2Url,
          });
        } else {
          setHeroData(defaultHero);
        }
      } catch (err) {
        console.error('Failed to load hero from Firestore:', err);
        setHeroData(defaultHero);
      }
    }
    loadHero();
  }, []);

  return (
    <div className="relative justify-center items-center bg-transparent w-full">
      <section className="max-w-7xl mx-auto px-4 py-28 gap-12 md:px-8 flex flex-col justify-center items-center relative z-10">
        <div className="flex flex-col justify-center items-center space-y-5 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-medium tracking-tighter mx-auto sm:text-5xl md:text-6xl text-balance bg-gradient-to-b from-sky-800 dark:from-sky-100 to-foreground dark:to-foreground bg-clip-text text-transparent leading-[1.2] py-1 pb-2 sm:pb-3 whitespace-pre-line">
            {heroData.title}
          </h1>
          <p className="max-w-2xl text-base sm:text-lg mx-auto text-muted-foreground text-balance leading-relaxed">
            {heroData.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 w-full sm:w-auto">
            <Button
              asChild
              className="w-full sm:w-auto shadow-lg px-7 py-2.5 rounded-xl font-medium bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
              size="lg"
            >
              <Link href={heroData.cta1Url}>{heroData.cta1Text}</Link>
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto shadow-lg px-7 py-2.5 rounded-xl font-medium bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
              size="lg"
            >
              <Link
                href={heroData.cta2Url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {heroData.cta2Text}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}


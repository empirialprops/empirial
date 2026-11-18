"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/data/site-data";

const MORE_TESTIMONIALS = [
  ...TESTIMONIALS,
  {
    id: "t-7",
    initials: "SA",
    name: "Sophie Anderson",
    role: "Product Lead at InnovateLab",
    company: "InnovateLab",
    stars: 5,
    text: "The analytics dashboard gives us insights we never had before. Real-time spread tracking and discount alerts have become our competitive advantage.",
  },
  {
    id: "t-8",
    initials: "JW",
    name: "James Wilson",
    role: "Prop Portfolio Manager",
    company: "Apex Fund",
    stars: 5,
    text: "Verification of payout proofs gave our prop trading desk 100% confidence. Their 13-column matrix saves hours of manual research.",
  },
  {
    id: "t-9",
    initials: "EP",
    name: "Elena Petrov",
    role: "CEO at GrowthMetrics",
    company: "GrowthMetrics",
    stars: 5,
    text: "The platform scales beautifully with our trading community. From beginner challenges to institutional combines, it guides every step.",
  },
];

export function TestimonialsGrid() {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const visibleCount = isMobile ? 3 : 6;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);
    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);
    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const displayedList = showAll ? MORE_TESTIMONIALS : MORE_TESTIMONIALS.slice(0, visibleCount);

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 flex flex-col gap-3 text-center sm:mb-16"
        >
          <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold text-primary">
            Community Trust
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight text-foreground">
            Loved by Teams Worldwide
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-sm sm:text-base">
            Join thousands of funded prop traders and institutional firms that rely on EMPIRIAL 2.0.
          </p>
        </motion.div>

        <div className="relative">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {displayedList.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                className="break-inside-avoid"
              >
                <div className="rounded-2xl border border-border/80 bg-card/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-cyan-500/5 group">
                  {/* Star Rating */}
                  <div className="mb-3 flex items-center gap-1">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 text-xs font-bold text-foreground">
                      {testimonial.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {testimonial.name}
                      </h4>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!showAll && MORE_TESTIMONIALS.length > visibleCount && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background via-background/90 to-transparent" />
          )}
        </div>

        {MORE_TESTIMONIALS.length > visibleCount && (
          <div className="mt-8 flex justify-center relative z-10">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="rounded-full px-6 shadow-sm"
            >
              {showAll ? "Show Less" : "View More Reviews"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsGrid;

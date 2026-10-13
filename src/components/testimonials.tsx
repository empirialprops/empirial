import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function Testimonials() {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const visibleCount = isMobile ? 2 : 6;

  const DEFAULT_TESTIMONIALS = [
    {
      name: "Sarah Chen",
      role: "Funded Forex Trader",
      avatar: "https://i.pravatar.cc/150?img=1",
      content:
        "Empirial made finding the perfect prop firm challenge effortless. The side-by-side comparison of drawdown rules, payout splits, and spread telemetry saved me weeks of manual research.",
      rating: 5,
    },
    {
      name: "Maria Garcia",
      role: "Day Trader & Active Member",
      avatar: "https://i.pravatar.cc/150?img=17",
      content:
        "Empirial is hands down the best platform for prop traders. The transparent firm ratings, prompt support, and community discussions helped me avoid hidden rules and get funded on my first try.",
      rating: 5,
    },
    {
      name: "Robert Taylor",
      role: "Macro & Swing Trader",
      avatar: "https://i.pravatar.cc/150?img=15",
      content:
        "Comparing evaluation rules across top prop firms side-by-side on Empirial completely transformed my strategy. I found a firm that matches my exact risk profile with static drawdown limits.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Prop Portfolio Manager",
      avatar: "https://i.pravatar.cc/150?img=5",
      content:
        "Empirial's evaluation breakdown tool helped me discover prop firms offering 90%+ profit splits and zero news trading restrictions. The community giveaway events and promo discounts are awesome!",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Futures & Algo Trader",
      avatar: "https://i.pravatar.cc/150?img=3",
      content:
        "The multi-firm rating system and community feedback on Empirial are unmatched. I filtered firms by instant funding, no-time-limit challenges, and verified payout proofs before committing capital.",
      rating: 5,
    },
    {
      name: "Kevin Lee",
      role: "Scalper & Crypto Trader",
      avatar: "https://i.pravatar.cc/150?img=19",
      content:
        "I use Empirial to track spread telemetry and compare firm rules across multiple prop accounts. Having real trader ratings and multi-firm comparisons in one place gives me complete confidence.",
      rating: 5,
    },
    {
      name: "Anuraj Sen",
      role: "Funded Trader (NYS Capital)",
      avatar: "https://i.pravatar.cc/150?img=11",
      content:
        "Passed my NYS Capital 1-Step evaluation using code EMPIRE! Empirial made comparing drawdown rules, payout speed, and profit targets effortless.",
      rating: 5,
    },
    {
      name: "David Krause",
      role: "95% Split Trader (GTF)",
      avatar: "https://i.pravatar.cc/150?img=33",
      content:
        "Got my first payout of $4,200 with Goat Funded Trader! Finding discount codes and genuine ratings on Empirial saved me time and capital.",
      rating: 5,
    },
    {
      name: "Alex Rivera",
      role: "Swing & Index Trader",
      avatar: "https://i.pravatar.cc/150?img=60",
      content:
        "The real-time payout telemetry and payout proof verification gave me peace of mind before buying my $100k account. Best prop firm aggregator hands down.",
      rating: 5,
    },
    {
      name: "Sophia Martinez",
      role: "Quantitative Analyst",
      avatar: "https://i.pravatar.cc/150?img=47",
      content:
        "Detailed spread analysis and commission data helped me optimize my automated strategies. Empirial is an indispensable tool for serious prop traders.",
      rating: 5,
    },
    {
      name: "James Wilson",
      role: "Commodities & Forex Trader",
      avatar: "https://i.pravatar.cc/150?img=12",
      content:
        "Finding prop firms with no minimum trading days and static drawdowns used to take hours. Empirial filters made it instant.",
      rating: 5,
    },
    {
      name: "Elena Rostova",
      role: "Multi-Account Prop Trader",
      avatar: "https://i.pravatar.cc/150?img=25",
      content:
        "Managing multiple funded accounts is much easier with Empirial's rules matrix. Highly recommended for any trader scaling capital.",
      rating: 5,
    },
  ];

  const [testimonials, setTestimonials] = useState<any[]>(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    async function loadTestimonials() {
      if (!db) return;
      try {
        const snap = await getDocs(collection(db, 'testimonials'));
        if (!snap.empty && snap.docs.length > 0) {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const activeList = list.filter((t: any) => t.is_active !== false);
          if (activeList.length > 0) {
            const defaultNames = new Set(DEFAULT_TESTIMONIALS.map(t => t.name.toLowerCase()));
            const customItems = activeList.filter((t: any) => !defaultNames.has((t.name || '').toLowerCase()));
            setTestimonials([...DEFAULT_TESTIMONIALS, ...customItems]);
          } else {
            setTestimonials(DEFAULT_TESTIMONIALS);
          }
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err);
        setTestimonials(DEFAULT_TESTIMONIALS);
      }
    }
    loadTestimonials();
  }, []);

  const StarIcon = () => (
    <svg
      className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4 fill-current"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  const renderCard = (testimonial: any, index: number) => {
    const initials = testimonial.name
      ? testimonial.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
      : "TR";

    const getFirmLink = (roleText: string) => {
      if (!roleText) return null;
      const lower = roleText.toLowerCase();
      if (lower.includes("nys")) return { name: "NYS Capital", href: "/firms/nys" };
      if (lower.includes("gtf") || lower.includes("goat")) return { name: "Goat Funded Trader", href: "/firms/gtf" };
      if (lower.includes("alpha")) return { name: "Alpha Capital", href: "/firms/alpha-capital" };
      if (lower.includes("ck")) return { name: "CK Capital", href: "/firms/ck-capital" };
      if (lower.includes("ftmo")) return { name: "FTMO", href: "/firms/ftmo" };
      return null;
    };

    const firmTarget = getFirmLink(testimonial.role || "");

    return (
      <div 
        itemScope 
        itemType="https://schema.org/Review" 
        className="h-full rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#121215] p-5 sm:p-6 shadow-xs transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between"
      >
        <div>
          <div 
            itemProp="reviewRating" 
            itemScope 
            itemType="https://schema.org/Rating"
            className="mb-3 sm:mb-4 flex items-center gap-1"
          >
            <meta itemProp="ratingValue" content={(testimonial.rating || 5).toString()} />
            <meta itemProp="bestRating" content="5" />
            {[...Array(testimonial.rating || 5)].map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>

          <p 
            itemProp="reviewBody" 
            className="mb-5 sm:mb-6 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal"
          >
            &ldquo;{testimonial.content}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm shrink-0 uppercase tracking-wider">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h4 
              itemProp="author" 
              itemScope 
              itemType="https://schema.org/Person" 
              className="truncate text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              <span itemProp="name">{testimonial.name}</span>
            </h4>
            <div className="truncate text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
              <span>{testimonial.role}</span>
              {firmTarget && (
                <Link 
                  href={firmTarget.href} 
                  className="text-foreground underline hover:text-muted-foreground ml-1 font-semibold"
                >
                  (View Firm)
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="testimonials" className="px-3 py-16 sm:px-4 sm:py-24 bg-transparent w-full">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 flex flex-col gap-3 text-center sm:mb-16"
        >
          <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Loved by Traders Worldwide
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-center text-xs sm:text-sm">
            Join thousands of traders that trust our platform.
          </p>
        </motion.div>

        <div className="relative">
          {/* Always Visible Primary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.slice(0, visibleCount).map((testimonial, index) => (
              <motion.div
                key={testimonial.name + index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                className="h-full"
              >
                {renderCard(testimonial, index)}
              </motion.div>
            ))}
          </div>

          {/* Smooth Collapsible Height Container for Expanded Items */}
          {testimonials.length > visibleCount && (
            <motion.div
              initial={false}
              animate={{
                height: showAll ? "auto" : 0,
                opacity: showAll ? 1 : 0,
              }}
              transition={{
                height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.35, ease: "easeInOut" },
              }}
              className="overflow-hidden"
            >
              <div className="pt-5 sm:pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {testimonials.slice(visibleCount).map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name + index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={showAll ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: showAll ? index * 0.04 : 0,
                      ease: "easeOut",
                    }}
                    className="h-full"
                  >
                    {renderCard(testimonial, index)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Smooth Fade Transition for Gradient Mask */}
          <AnimatePresence>
            {!showAll && testimonials.length > visibleCount && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0A0A0A] dark:via-[#0A0A0A]/80 dark:to-transparent z-10"
              />
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 relative z-20">
          <Button
            variant="outline"
            className="rounded-xl px-5 h-9 sm:h-10 font-semibold text-xs sm:text-sm border-zinc-300 dark:border-zinc-800 bg-white dark:bg-card text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-all duration-200 active:scale-95 shadow-xs"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "View less" : "View more"}
          </Button>
          <a
            href="/reviews"
            className="inline-flex items-center justify-center rounded-xl px-5 h-9 sm:h-10 font-semibold text-xs sm:text-sm bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-200 active:scale-95 shadow-xs"
          >
            Give Review
          </a>
        </div>
      </div>
    </section>
  );
}



import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getFaqs } from "@/lib/firebase/services";
import { JsonLd, getFAQPageSchema } from "@/components/seo/json-ld";

const DEFAULT_FAQS = [
  {
    question: "What is EMPIRIAL?",
    answer: "EMPIRIAL is an independent proprietary trading intelligence matrix and evaluation comparison platform. We provide forensic audits of prop firms, drawdown and rules comparison, verified payout proofs, and daily updated discount coupon codes.",
  },
  {
    question: "How does EMPIRIAL verify prop firm payout proofs?",
    answer: "Every payout proof featured on EMPIRIAL undergoes cryptographic hash checking, banking transaction validation, and direct confirmation from funded traders in our community to guarantee 100% authentic payout data.",
  },
  {
    question: "Are the discount codes and coupons on EMPIRIAL real?",
    answer: "Yes. All promo codes, discount coupons, and exclusive offers listed on EMPIRIAL are officially verified with our partner proprietary trading firms and re-tested daily to ensure maximum trader savings.",
  },
  {
    question: "What is the difference between 1-Step and 2-Step evaluation challenges?",
    answer: "A 1-Step challenge requires hitting a single profit target (typically 8-10%) without a second evaluation phase, often featuring a trailing drawdown limit. A 2-Step evaluation involves Phase 1 (typically 8-10% target) and Phase 2 (typically 5% target), usually offering static balance-based drawdowns and higher leverage.",
  },
  {
    question: "How do trailing drawdown vs static drawdown limits work?",
    answer: "A static drawdown is calculated fixedly from your starting account balance (e.g., $100k account with 10% max loss breaches at $90k). A trailing drawdown trails your highest closed equity / high-water mark, locking in minimum equity requirements as your profit increases.",
  },
  {
    question: "Can prop trading firms pay to change their audit score on EMPIRIAL?",
    answer: "Never. EMPIRIAL operates with complete forensic independence. Rankings, trust scores, spread telemetry, and challenge evaluations are mathematically computed from verifiable broker data and unfiltered trader feedback.",
  },
  {
    question: "What trading platforms do verified prop firms support?",
    answer: "The prop firms audited on EMPIRIAL support institutional trading platforms including MetaTrader 5 (MT5), cTrader, Match-Trader, TradeLocker, and DXtrade across desktop, mobile, and web terminals.",
  },
  {
    question: "How do I choose the best prop trading firm for my strategy?",
    answer: "Use our 13-column Challenges Matrix and Radar Comparator to filter firms by payout speed, profit target percentage, maximum drawdown style, daily loss buffers, news trading permissions, and weekend holding rules.",
  },
  {
    question: "Is EMPIRIAL free to use for retail traders?",
    answer: "Yes, access to our full comparison matrix, telemetry data, verified coupon codes, payout audits, and community educational guides is completely free for all traders worldwide.",
  },
  {
    question: "How do I join the EMPIRIAL community and get payout alerts?",
    answer: "You can join our official Discord community of 2,500+ active traders to access live deal drops, prop firm payout alerts, direct recruiter tickets, and peer-to-peer strategy discussions.",
  },
];

export default function Faq() {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getFaqs();
        if (data && data.length > 0) {
          const mapped = data.map((item) => ({
            question: item.question,
            answer: item.answer,
          }));
          setFaqs(mapped);
        }
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      }
    }
    loadFaqs();
  }, []);

  return (
    <motion.section
      initial={{ y: 20, opacity: 0 }}
      whileInView={{
        y: 0,
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0 }}
      className="relative w-full max-w-7xl mx-auto px-4 py-20 gap-8 md:px-8 flex flex-col justify-center items-center bg-transparent"
    >
      {/* FAQPage Structured Data Schema */}
      <JsonLd data={getFAQPageSchema(faqs)} />

      <div className="flex flex-col gap-3 justify-center items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>KNOWLEDGE BASE</span>
        </div>
        <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
          Frequently Asked Questions
        </h2>
        <p className="max-w-xl text-muted-foreground text-center text-xs sm:text-sm">
          Everything you need to know about prop firm evaluation rules, payout audits, and verified discounts.
        </p>
      </div>

      <div className="flex w-full max-w-2xl">
        <Accordion type="multiple" className="w-full space-y-2">
          {faqs.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 bg-white dark:bg-card overflow-hidden transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold text-xs sm:text-sm text-foreground py-4 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-4 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/data/site-data";
import { getFaqs } from "@/lib/firebase/services";

export function FaqAccordion() {
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getFaqs();
        if (data && data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(FAQ_ITEMS);
        }
      } catch (err) {
        console.error("Failed to load FAQs:", err);
        setFaqs(FAQ_ITEMS);
      }
    }
    loadFaqs();
  }, []);

  return (
    <motion.section
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-20 px-4 sm:px-6 lg:px-8 relative max-w-4xl mx-auto"
    >
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold text-primary">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight text-foreground">
          Got Questions? We Have Answers
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Everything you need to know about our forensic audit standards, challenge rules, and payout guarantees.
        </p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-md shadow-sm">
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
          {faqs.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-border/60 py-1"
            >
              <AccordionTrigger className="text-base font-semibold text-foreground hover:text-primary">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}

export default FaqAccordion;

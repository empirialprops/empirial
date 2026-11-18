"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PRICING_PLANS } from "@/lib/data/site-data";
import { openAuthModal } from "@/lib/utils/auth-store";
import { getPricingPlans } from "@/lib/firebase/services";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await getPricingPlans();
        if (data && data.length > 0) {
          setPlans(data);
        } else {
          setPlans(PRICING_PLANS);
        }
      } catch (err) {
        console.error("Failed to load plans:", err);
        setPlans(PRICING_PLANS);
      }
    }
    loadPlans();
  }, []);

  const handleChoosePlan = (planId: string) => {
    openAuthModal();
  };

  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-20 sm:py-28 relative">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12 flex flex-col gap-3 text-center sm:mb-16"
      >
        <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold text-primary">
          Transparent Pricing
        </div>
        <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight text-foreground">
          Choose Your Plan
        </h2>
        <p className="mx-auto max-w-xl text-muted-foreground text-sm sm:text-base">
          Select the perfect plan for your prop trading strategy. Upgrade, downgrade, or cancel at any time.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="inline-flex p-1 rounded-xl bg-card border border-border">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded">Save 20%</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 md:gap-8 items-stretch">
        {plans.map((plan, index) => {
          const isPopular = plan.isPopular;
          const calculatedPrice =
            billingCycle === "annual" ? Math.round(plan.price * 0.8) : plan.price;

          return (
            <motion.div
              key={plan.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative flex flex-col ${isPopular ? "md:scale-[1.04] z-10" : ""}`}
            >
              <Card
                className={`relative h-full flex flex-col justify-between rounded-3xl ${
                  isPopular
                    ? "border-2 border-primary/90 bg-card shadow-xl shadow-cyan-500/10"
                    : "border border-border/80 bg-card/60 hover:border-border"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="rounded-full border border-primary bg-primary text-primary-foreground px-3.5 py-0.5 text-xs font-bold shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardContent className="p-6 pt-8 sm:p-8">
                  <div className="mb-6 text-center">
                    <h3 className="mb-1 text-xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                      {plan.subtitle}
                    </p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        ${calculatedPrice}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  <ul className="space-y-3">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li
                        key={featureIndex}
                        className="flex items-start text-xs text-muted-foreground"
                      >
                        <CheckIcon className="mr-2 h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-0 sm:p-8 sm:pt-0">
                  <Button
                    onClick={() => handleChoosePlan(plan.id)}
                    className="w-full"
                    variant={isPopular ? "gradient" : "outline"}
                    size="lg"
                  >
                    {plan.ctaText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default PricingSection;

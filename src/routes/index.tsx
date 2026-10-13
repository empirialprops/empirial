import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EMPIRIAL — Compare Prop Trading Firms, Rules & Payout Proof" },
      { name: "description", content: "Compare prop trading firms side-by-side: drawdown rules, profit splits, payout speed and verified discount codes. Trusted by traders worldwide." },
      { property: "og:title", content: "EMPIRIAL — Compare Prop Trading Firms, Rules & Payout Proof" },
      { property: "og:description", content: "Compare prop trading firms side-by-side: drawdown rules, profit splits, payout speed and verified discount codes. Trusted by traders worldwide." },
    ],
  }),
  component: Page,
});

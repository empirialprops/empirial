import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/firms/page";

export const Route = createFileRoute("/firms/")({
  head: () => ({
    meta: [
      { title: "Compare Prop Trading Firms 2026 | Rules, Splits & Reviews — EMPIRIAL" },
      { name: "description", content: "Browse and compare verified prop firms by drawdown rules, profit split, payout speed and trader reviews." },
      { property: "og:title", content: "Compare Prop Trading Firms 2026 | Rules, Splits & Reviews — EMPIRIAL" },
      { property: "og:description", content: "Browse and compare verified prop firms by drawdown rules, profit split, payout speed and trader reviews." },
    ],
  }),
  component: Page,
});

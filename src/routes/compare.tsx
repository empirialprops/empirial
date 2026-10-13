import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/compare/page";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Prop Firms Side-by-Side — EMPIRIAL" },
      { name: "description", content: "Put top prop firms head-to-head on rules, pricing, splits and payout speed." },
      { property: "og:title", content: "Compare Prop Firms Side-by-Side — EMPIRIAL" },
      { property: "og:description", content: "Put top prop firms head-to-head on rules, pricing, splits and payout speed." },
    ],
  }),
  component: Page,
});

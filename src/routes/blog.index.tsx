import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/blog/page";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "State Hall — Prop Trading Insights & Guides | EMPIRIAL" },
      { name: "description", content: "Live prop firm announcements, institutional trade ideas, challenge discounts, and psychological frameworks." },
      { property: "og:title", content: "State Hall — Prop Trading Insights & Guides | EMPIRIAL" },
      { property: "og:description", content: "Live prop firm announcements, institutional trade ideas, challenge discounts, and psychological frameworks." },
    ],
  }),
  component: Page,
});

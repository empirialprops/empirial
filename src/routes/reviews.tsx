import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/reviews/page";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Prop Trader Reviews — Real Trader Feedback | EMPIRIAL" },
      { name: "description", content: "Read verified reviews from funded traders on top prop firms — payouts, support, and rule enforcement." },
      { property: "og:title", content: "Prop Trader Reviews — Real Trader Feedback | EMPIRIAL" },
      { property: "og:description", content: "Read verified reviews from funded traders on top prop firms — payouts, support, and rule enforcement." },
    ],
  }),
  component: Page,
});
